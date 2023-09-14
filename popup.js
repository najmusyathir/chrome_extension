//popup.js v1.3

const currentURL = window.location.href;
console.log('Current Link: ' + currentURL);

//List of function

//1. listen from background.js
const dataContainer = document.getElementById("data_container");

let output = null;
let data = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'sentToPopup') {
        // Display the scraped data in the popup console
        output = JSON.stringify(message.data)
        console.log('Received scraped data in popup.js:', output);
        dataContainer.innerHTML = generateDataContainerHTML(message.data);

    }
});

//evenListener for button
document.addEventListener('DOMContentLoaded', function () {
    const refreshButton = document.getElementById('refreshButton');
    const cpuFetchButton = document.getElementById('cpuFetchButton');
    const cpuTableDiv = document.getElementById('cpuTable');
    const nlpclassification = document.getElementById('checkButton');

    //Refresh button
    refreshButton.addEventListener('click', function () {

        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const activeTab = tabs[0];
            chrome.tabs.reload(activeTab.id);
        });

    });

    //Cpu List Button
    cpuFetchButton.addEventListener('click', async () => {
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

    //This button send the data from extension to API
    nlpclassification.addEventListener('click', async () => {

        try {
            if (output !== null) {
                const response = await fetch("http://127.0.0.1:8000/input/component_identidier", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: output
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log("Response from FastAPI:", data);
                    // Process the data as needed here
                } else {
                    console.error('Response error:', response.status);
                    // Handle the error gracefully, e.g., display an error message to the user
                }
            }
            else {
                console.error('No data send to FastAPI');
            }

        } catch (error) {
            console.error('Fetch nlpclassification response error:', error);
        }
    });


});

//Fetch Product function
function generateDataContainerHTML(data) {
    let input = '';
    let item_count = 0;

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
        item_count++;

    });

    //Make sure item count is two only
    if (item_count == 2){
        //document.querySelector('.checkButton').style.visibility = 'visible';
        return input;
    }

    else
        return '<div class="early_message"><strong>item_count Error: '+item_count+' </strong> Please check <strong> two</strong>  item only.</div>';
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