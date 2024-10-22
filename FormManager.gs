

const EditForm = () => {
  try {
    let choices = [...SheetService.GetColumnDataByHeader(OTHERSHEETS.Inventory, `Item Name`)]
      .filter(Boolean);
    console.warn(`Updating Choices....`);
    const form = FormApp.openById(FORM.id);
    let items = form.getItems();
    items.forEach(item => {
      // console.info(`${item.getIndex()}: ${item.getTitle()}`);
      if(item.getTitle() == `Please select the tools you would like to check out.`) {
        let index = item.getIndex();
        form.getItems()[index]
          .asCheckboxItem()
          .setTitle(`Please select the tools you would like to check out.`)
          .setHelpText(`Choose 1 or many.`)
          .setChoiceValues(choices)
        console.warn(`Choices Updated.`)
      }
    });
    return 0;
  } catch(err) {
    console.error(`"EditForm()" failed : ${err}`);
    return 1;
  }
}