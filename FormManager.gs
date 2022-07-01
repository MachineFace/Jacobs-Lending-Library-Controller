

const EditForm = () => {
  let choices = GetColumnDataByHeader(OTHERSHEETS.Inventory, `Item Name`).filter(Boolean);
  console.warn(`Updating Choices....`)
  let question = FORM.form.getItems()[4]
    // .asCheckboxItem()
    // .setTitle(`Please select the tools you would like to check out.`)
    // .setHelpText(`Choose 1 or many.`)
    // .setChoiceValues(choices)
    console.warn(question.getTitle())
  console.warn(`Choices Updated.`)
}