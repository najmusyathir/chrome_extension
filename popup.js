//popup.js v1.3

const currentURL = window.location.href;
console.log('Current Link: ' + currentURL);

//List of function

//1. listen from background.js
const dataContainer = document.getElementById("data_container");
const outputDiv = document.getElementById('output_container');

let fromLazadaScraper = null;
let data = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'sentToPopup') {
        // Display the scraped data in the popup console
        fromLazadaScraper = JSON.stringify(message.data)
        console.log('Received scraped data in popup.js:', fromLazadaScraper);
        dataContainer.innerHTML = generateDataContainerHTML(message.data);
    }
});

//evenListener for button
document.addEventListener('DOMContentLoaded', function () {
    const refreshButton = document.getElementById('refresh_button');
    const cpuFetchButton = document.getElementById('cpu_fetch_button');
    const cpuTableDiv = document.getElementById('cpu_table');
    const nlpclassification = document.getElementById('check_button');

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
            const response = await fetch('https://pc-x5qm.onrender.com/cpu/all');
            const data = await response.json();
            const cpuDetails = data.cpu_details;

            const tableHTML = generateTableHTML(cpuDetails);
            cpuTableDiv.innerHTML = tableHTML;
        } catch (error) {
            console.error('Error fetching CPU details:', error);
        }
    });

    function generateTableHTML(itemDetails) {
        let tableHTML = `
      <table>
        <tr class="tb_head">
          <th>No.</th>
          <th>Models</th>
          <th>Socket Type</th>
        </tr>
    `;

        itemDetails.forEach((details, index) => {
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
            console.log("Before data sent to FastAPI:\n" + fromLazadaScraper);
            if (fromLazadaScraper !== null) {
                let data = ""
                const response = await fetch("https://pc-x5qm.onrender.com/input/component_compatibility_checker", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: fromLazadaScraper
                });
                if (response.ok) {
                    data = await response.json();
                    console.log("Response from FastAPI:", data);
                    // Process the data as needed here

                    if (typeof data[2] === 'object' && data[2].hasOwnProperty('output')) {
                        console.log("This is the output to HTML: \nThis is CPU socket: " + data[2].cpu_socket + "\nThis is MB socket : " + data[2].mb_socket);

                        // Check if the output contains "Error"
                        if (data[2].output.includes("Unidentified")) {

                            outputContainer = `<div id="output_error_container"> ${data[2].output} </div>`;

                            outputContainer = `<div class="output_false_container"><div class="output_false_container_child1"><img src="images/redcross.jpg"></div><div class="output_false_container_child2"><h7> ${data[2].output} </h7><br>Item selected is not motherboard + CPU combo<br></div></div>`;
                            outputDiv.innerHTML = outputContainer;
                        }
                        else if (data[2].output.includes("Incompatible")) {

                            outputContainer = `<div id="output_error_container"> ${data[2].output} </div>`;

                            outputContainer = `<div class="output_false_container"><div class="output_false_container_child1"><img src="images/redcross.jpg"></div><div class="output_false_container_child2"><h7> ${data[2].output} </h7><br>Please check component socket <br> <h8>CPU Socket</h8> : <strong>${data[2].cpu_socket}</strong><br><h8 style="margin-right: 9px;">MB Socket</h8> : <strong>${data[2].mb_socket}</strong></div></div>`;
                            outputDiv.innerHTML = outputContainer;
                        }

                        else {
                            outputContainer = `<div id="output_true_container"> ${data[2].output} </div>`;

                            outputContainer = `<div class="output_true_container"><div class="output_true_container_child1"><img src="images/greentick.jpg"></div><div class="output_true_container_child2"><h7> ${data[2].output} </h7><br>Socket type: ${data[2].cpu_socket}</div></div>`;

                            outputDiv.innerHTML = outputContainer;
                        }
                    } else {
                        console.error('Data format error:', data);
                    }

                }
                else {
                    console.error('Response error:', response.status);
                 
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
    if (item_count == 2) {
        const checkButton = document.getElementById('checkButton');
        if (checkButton) {
            checkButton.style.visibility = 'visible';
        }
        return input;
    }

    else
        return '<div class="early_message"><strong>item_count Error: ' + item_count + ' </strong> Please check <strong> two</strong>  item only.</div>';
}

//selectable container
document.addEventListener('DOMContentLoaded', function () {


    let currentlySelected = null; 

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
