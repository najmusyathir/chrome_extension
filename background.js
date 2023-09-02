//background.js v1.3



//List of functions:
//1. Listener from lazadaScript.js
//2. Do data scraping on target website
//2.1 Send scraped data to FastAPI for temp saving >> can comment this function to remove some error
//3. Data clean-up *Don't touch except doing for NLP

// Listen for messages from the content script (popup.js)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'scrapeLazadaData') {

        const currentURL = message.url; // Get the URL from the message sent by the content script
        fetch_data_from_lazada(currentURL, sendResponse);
        return true;
    }
});


//2.
function fetch_data_from_lazada(url, sendResponse) {
    fetch(url)
        //Error Handler
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })

        //Scraping Successful
        .then(data => {
            const cleanedData = processData(data);

            //2.1 Send the cleanedData to your FastAPI server
            fetch("http://127.0.0.1:8000/input/show_inputs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(cleanedData)
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Data sent to FastAPI:", data);
                })
                .catch(error => {
                    console.log("Error sending data to FastAPI:", error);
                });

            // Send the response to the popup.js 
            chrome.runtime.sendMessage({ action: 'sentToPopup', data: cleanedData });

            //This send data back to lazadaScript under scrapeLazadaData action message
            sendResponse({ data: cleanedData });

        })

        //Do data scraping but item empty/wrong format
        .catch(error => {
            console.error('Error fetching data:', error);
            sendResponse({ error: 'Failed to scrape data' });
        });
}


//3. Clean up data process
function processData(data) {
    const startIndex = data.indexOf('window.__initData__ = {');
    const endIndex = data.indexOf('};', startIndex) + 1;

    if (startIndex !== -1 && endIndex !== -1) {
        const initData = data.substring(startIndex, endIndex);

        // Clean initData
        const cleanedInitData = initData.replace('window.__initData__ =', '').trim();

        // Parse the cleanedInitData to JSON string
        const parsedData = JSON.parse(cleanedInitData);

        const itemData = parsedData.module.data;
        if (itemData) {

            const itemList = []; // List to store extracted item details

            for (const key in itemData) {
                if (key.startsWith('item_')) {
                    const item = itemData[key];
                    const img = item.fields.img;
                    const title = item.fields.title;
                    const checkboxStatus = item.fields.checkbox.selected;
                    const skuText = item.fields.sku.skuText;

                    // Create an object with extracted details and add it to the itemList
                    const itemDetails = {
                        title: title,
                        sku: skuText,
                        checkbox: checkboxStatus,
                        img: img
                    };

                    if (checkboxStatus == true) {
                        itemList.push(itemDetails);
                    }
                }
            }

            // Return the list of extracted item details
            return itemList;

        } else {
            throw new Error('No item data found');
        }

    } else {
        throw new Error('Failed to scrape data');
    }
}


