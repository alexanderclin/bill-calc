// Compute the bill split
// (Total per person / Total pre tax and tip) * Total after tax and tip
const calculateBillSplit = () => {
    let totalPerPerson = new Map();
    let unaccountedTotal = 0.0;

    let calculatedTotalPrice = 0.0;

    const items = document.querySelectorAll('.item');
    items.forEach((item) => {
        // Get price
        const price = parseFloat(item.querySelector('#price').value);
        calculatedTotalPrice += price;

        // Handle purchasers
        const purchasersStr = item.querySelector("#purchasers").value;
        if (purchasersStr.length === 0) {
            return;
        }

        // Check calculated price for error handling
        let calculatedPrice = 0.0;

        let unhandledPurchasers = [];

        const purchasers = purchasersStr.split(",");
        purchasers.forEach((purchaser) => {
            const purchaserAndPercent = purchaser.split(":");
            
            const purchaserName = purchaserAndPercent[0];
            if (purchaserAndPercent.length == 2) {
                const purchaserPercent = parseFloat(purchaserAndPercent[1]);
                const purchaserPrice = purchaserPercent * price;
                totalPerPerson.set(purchaserName, (totalPerPerson.get(purchaserName) ?? 0) + purchaserPrice);
                calculatedPrice += purchaserPrice;
            } else {
                unhandledPurchasers.push(purchaserName);
            }
        });

        // Handle unhandled purchasers with an even split
        const unhandledPurchaserPrice = (1.0/unhandledPurchasers.length) * price;
        unhandledPurchasers.forEach((purchaserName) => {
            totalPerPerson.set(purchaserName, (totalPerPerson.get(purchaserName) ?? 0) + unhandledPurchaserPrice);
            calculatedPrice += unhandledPurchaserPrice;
        });

        // Remaining amount goes to the unaccounted total
        unaccountedTotal += price - calculatedPrice;

        console.log(calculatedPrice);
        console.log(totalPerPerson);
        console.log(unaccountedTotal);
    });

    // Figure out unaccounted total from total pre tax and tip
    totalPreTaxAndTip = document.querySelector('#total-pre').value;
    if (totalPreTaxAndTip === '') {
        totalPreTaxAndTip = calculatedTotalPrice;
    } else {
        unaccountedTotal = totalPreTaxAndTip - calculatedTotalPrice;
    }
    
    // Use same value for after tax and tip as pre tax and tip if empty
    totalAfterTaxAndTip = document.querySelector('#total-after').value;
    if (totalAfterTaxAndTip === '') {
        totalAfterTaxAndTip = totalPreTaxAndTip;
    }

    totalPerPerson.forEach((value, key, map) => {
        map.set(key, (value / totalPreTaxAndTip) * totalAfterTaxAndTip);
    });
    const unaccountedTotalAfterTaxAndTip = (unaccountedTotal / totalPreTaxAndTip) * totalAfterTaxAndTip;
    console.log(totalPerPerson);
    console.log(unaccountedTotalAfterTaxAndTip);

    // Make the table
    const makeRow = (person, total) => {
        let row = document.createElement('tr');

        let nameCell = document.createElement('td');
        let nameCellText = document.createTextNode(person);
        nameCell.appendChild(nameCellText);
        row.appendChild(nameCell);

        let totalCell = document.createElement('td');
        let totalCellText = document.createTextNode(`\$${total}`);
        totalCell.appendChild(totalCellText);
        row.appendChild(totalCell);

        return row;
    };
    let table = document.createElement('table');
    if (unaccountedTotal !== 0) {
        table.appendChild(makeRow("(unaccounted)", unaccountedTotalAfterTaxAndTip));
    }
    totalPerPerson.forEach((value, key, map) => {
        table.appendChild(makeRow(key, value));
    });

    // Display the table
    const results = document.querySelector('#results');
    results.innerHTML = '';
    results.appendChild(table);
}

const debounce = (callback, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        callback.apply(this, args);
      }, wait);
    };
};

// Adds an item if enter is pressed.
const handleEnter = (event) => {
    if (event.key === "Enter") {
        // Call your function here
        addItem();
    }
};

// Adds a new item with button to remove the item.
const addItem = () => {
  const originalDiv = document.querySelector("#item0");
  const clonedDiv = originalDiv.cloneNode(true);

  // Update the cloned div
  clonedDiv.removeAttribute("id");
  clonedDiv.querySelectorAll("input, select, textarea").forEach((el) => {
    el.value = ""; // Reset the values of the form elements
  });
  clonedDiv.querySelector('#price').addEventListener("keypress", handleEnter);

  // Update the button
  const buttonDiv = clonedDiv.querySelector("#remove-button-div");
  buttonDiv.style.display = "block";
  const button = buttonDiv.querySelector("#remove-button");
  button.addEventListener("click", () => {
    clonedDiv.remove();
    calculateBillSplit();
  });

  // Put it at the end
  const endDiv = document.querySelector("#item-end");
  endDiv.parentNode.insertBefore(clonedDiv, endDiv);

  // Move focus to the new div
  clonedDiv.querySelector("#name").focus();
};

document.querySelector("#bill-form").addEventListener("submit", (event) => {
  event.preventDefault();
});
document.querySelector("#bill-form").addEventListener(
    "keyup",
    debounce((event) => {
        if (event.key === "Enter" || event.key === "Tab") {
            return;
        }
        console.log("running bill calc");
        calculateBillSplit();
    }, 300)
);

document.querySelector("#price").addEventListener("keypress", handleEnter);

document.querySelector("#add-item").addEventListener("click", addItem);
