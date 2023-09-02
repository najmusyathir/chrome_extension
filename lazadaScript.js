// lazadaScripts.js v1.3

const currentURL = window.location.href;


if (!currentURL.includes("chrome-extension:")) {
  //alert("popup.js v1.1.1\n\nDo data scraping:\n" + currentURL);
  runDataScraping();
}

//List of Function
//1. runDataScraping()
//2. Floating message function * Don't touch yet

//1:
function runDataScraping() {
  // Send a message to the background script to initiate data scraping
  chrome.runtime.sendMessage({ action: 'scrapeLazadaData', url: currentURL }, (response) => {

    if (response.error) {
      //Error handler
      console.error('Error occurred during data scraping:' + response.error);
      showFloatingMessage('This Error encountered during runDataScraping()');
    }

    else if (response.data) {
      //scraping Successful
      showFloatingMessage("Data scraping successful");
      console.log('From lazadaScript:', response.data);
    }

    else {
      //data Scraping is empty
      console.error('No data was scraped.');
      console.log('No Data selected. Please tick two items');
      showFloatingMessage('Null data encountered');
    }
  });
}

//2. Function to display a floating message on the page
function showFloatingMessage(message) {
  const floatingMessage = document.createElement('div');
  floatingMessage.textContent = message;
  floatingMessage.style.position = 'fixed';
  floatingMessage.style.top = '40px';
  floatingMessage.style.right = '20px'; // Position at the right side of the browser
  floatingMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  floatingMessage.style.color = 'white';
  floatingMessage.style.padding = '8px 16px';
  floatingMessage.style.borderRadius = '4px';
  floatingMessage.style.opacity = '0'; // Set initial opacity to 0

  document.body.appendChild(floatingMessage);


  // Fade-out transition
  floatingMessage.getBoundingClientRect(); // Trigger a reflow to apply the initial opacity setting before the transition
  floatingMessage.style.transition = 'opacity 1s';
  floatingMessage.style.opacity = '1';

  // Set a timeout to remove the message after the fade-out transition is complete
  setTimeout(() => {
    floatingMessage.style.opacity = '0';
    setTimeout(() => {
      floatingMessage.remove();
    }, 1000);
  }, 4000); // Wait for 4 seconds before starting the fade-out transition
};
