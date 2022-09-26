

const EditForm = () => {
  let choices = GetColumnDataByHeader(OTHERSHEETS.Inventory, `Item Name`).filter(Boolean);
  console.warn(`Updating Choices....`)
  try {
    const form = FormApp.openById(FORM.id);
    let items = form.getItems()
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
    })
  } catch(err) {
    console.error(`Whoops: Couldn't update the form items: ${err}`);
  }
}