

/**
 * Inventory Manager Class
 */
class InventoryManager {
  constructor({
    basket : basket = [],
  }) {
    this.basket = basket ? basket : [];
    this.sheet = OTHERSHEETS.Inventory;
  }

  /**
   * Checkout Basket
   */
  CheckOutBasket() {
    // Count,	Item Name,	Description,	Barcode,	Notes,
    console.warn(`Checking out items from inventory: ${this.basket}`);
    [...this.basket].forEach(item => {
      let row = 1;
      let finder = this.sheet.createTextFinder(item).findNext();
      if (finder != null) row = finder.getRow();
      if (row < 2) row = 2;
      let itemCount = GetByHeader(this.sheet, `Count`, row);
      if (itemCount <= 0) console.warn(`Out of inventory!`);
      else SetByHeader(this.sheet, `Count`, row, itemCount - 1);
    });
    console.warn(`Checkout Complete`);
  }

  /**
   * Checkin Basket
   */
  CheckInBasket() {
    // Count,	Item Name,	Description,	Barcode,	Notes,
    console.warn(`Checking in items to inventory: ${this.basket}`);
    [...this.basket].forEach(item => {
      let row = 1;
      let finder = this.sheet.createTextFinder(item).findNext();
      if (finder != null) row = finder.getRow();
      if(row < 2) row = 2;
      let itemCount = GetByHeader(this.sheet, `Count`, row);
      SetByHeader(this.sheet, `Count`, row, itemCount + 1);
    });
    console.warn(`CheckIn Complete`);
  }

  /**
   * Reset Inventory
   */
  ResetInventory() {
    let lastRow = this.sheet.getLastRow();
    for(let i = 2; i <= lastRow; i++) {
      SetByHeader(this.sheet, `Count`, i, 20);
    }
    console.warn(`Inventory Reset Complete`);
  }

}




const _testResetInventory = () => new InventoryManager({}).ResetInventory();


