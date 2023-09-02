//popup.js v1.3

const currentURL = window.location.href;
console.log('Current Link: '+currentURL);

//List of function

//1. listen from background.js
output = "test2";
const dataContainer = document.getElementById("data_container");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'sentToPopup') {
        // Display the scraped data in the popup console
        console.log('Received scraped data in popup.js:',JSON.stringify(message.data));

        output = JSON.stringify(message.data);
        dataContainer.innerHTML = generateDataContainerHTML(message.data);
    }
});

//evenListener for button
document.addEventListener('DOMContentLoaded', function () {
    const refreshButton = document.getElementById('refreshButton');
    const fetchButton = document.getElementById('fetchButton');
    const cpuTableDiv = document.getElementById('cpuTable');

    //Refresh button
    refreshButton.addEventListener('click', function () {

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            chrome.tabs.reload(activeTab.id);
        });

    });

    //Cpu List Button
    fetchButton.addEventListener('click', async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/cpu/all');
            const data = await response.json();
            const cpuDetails = data.cpu_details;

            const tableHTML = generateTableHTML(cpuDetails);
            cpuTableDiv.innerHTML = tableHTML;
        } catch (error) {
            console.error('Error fetching CPU details:', error);
        }
    });

    function generateTableHTML(cpuDetails) {
        let tableHTML = `
      <table>
        <tr class="tb_head">
          <th>No.</th>
          <th>Models</th>
          <th>Socket Type</th>
        </tr>
    `;

        cpuDetails.forEach((details, index) => {
            const rowHTML = `
        <tr>
          <td class="td">${index + 1}</td>
          <td class="td">${details.name}</td>
          <td class="td">${details.socket}</td>
        </tr>
      `;
            tableHTML += rowHTML;
        });

        tableHTML += '</table>';
        return tableHTML;
    }


});

function generateDataContainerHTML(data) {
    let input = '';

    data.forEach((item, index) => {
        inputContainer = `
            <div class="input_container">
                <div class="no_item">${index + 1}</div>

                <div class="input_container_child">
                    <div class="title">${item.title}</div>
                    <div class="sku">${item.sku}</div>
                    <div class="checkbox">${item.checkbox}</div>
                </div>
                <div class="img"><img src="${item.img}" alt="Product Image"></div>
            </div>
        `;
        input += inputContainer;
    });

    return input;
}


//selectable container
document.addEventListener('DOMContentLoaded', function () {
    // ... (your other code)

    let currentlySelected = null; // To track the currently selected container

    // Toggle selected class on click
    dataContainer.addEventListener('click', function (event) {
        const selectedContainer = event.target.closest('.input_container');

        if (selectedContainer) {
            if (currentlySelected) {
                currentlySelected.classList.remove('selected'); // Remove selected class from the previous container
            }

            selectedContainer.classList.add('selected'); // Add selected class to the clicked container
            currentlySelected = selectedContainer; // Update the currently selected container
        }
    });
});