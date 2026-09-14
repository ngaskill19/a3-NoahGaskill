// FRONT-END (CLIENT) JAVASCRIPT HERE

document.addEventListener("DOMContentLoaded", async () =>{
  const response = await fetch('/docs', {method :'GET'})
  const list = await response.json()
  console.log(list)
  for (let recipe of list){ buildTable(recipe)}
})

const submit = async function( event ) {
  // stop form submission from trying to load a new .html page for displaying results...
  event.preventDefault()
  
  const nameInput = document.querySelector( '#recipe-name' ),
        timeInput = document.querySelector('#cook-time'),
        ingredientLi = document.querySelectorAll('#ingredients-list > li'),
        instructionLi = document.querySelectorAll('#instructions-list > li'),
        submitBtn = document.querySelector('#submit'), 
        form = document.querySelector('form')

  
  //get ingredients and instructions out of displayed lists on form
  const listOfIngredients = []
  for (let li of ingredientLi){
    const text = li.innerText
    listOfIngredients.push(text.substring(0,text.length-1))
  }

  const listOfInstructions = []
  for (let li of instructionLi){
    const text = li.innerText
    listOfInstructions.push(text.substring(0,text.length-1))
  }
  //send the data
  const json = { recipeName: nameInput.value, 
    ingredients : listOfIngredients,
    instructions : listOfInstructions,  
    cookTime : parseInt(timeInput.value)}

  let route = ''
  if (submitBtn.dataset.action === "submit") route = '/add'
  else if (submitBtn.dataset.action === "edit"){
    route = '/update'
    json._id = form.dataset.id
  } 

  const body = JSON.stringify( json )
  console.log(`Sending ${body}`)
  const response = await fetch( route, {
    headers:  {'Content-Type' : 'application/json'},
    method:'POST',
    body : body
  })
  //reset form and add new recipe to page
  const ingredientList = document.querySelector("#ingredients-list"),
        instructionList = document.querySelector("#instructions-list")
  ingredientList.innerHTML = ''
  instructionList.innerHTML = ''

  const recipe = await response.json()
  console.log(recipe)

  if (submitBtn.dataset.action == "edit"){
    const oldTable = document.querySelector(`table[data-id="${recipe._id}"]`)
    const newTable = buildTable(recipe)
    oldTable.replaceWith(newTable)
    delete form.dataset.id 
    submitBtn.dataset.action = "submit" 
    submitBtn.innerText = "Submit"
    heading.innerText = "Add Recipe:"
  }
  else{
    const recipes = document.querySelector('section.box')
    buildTable(recipe)
  }
}

window.onload = function() {
  const button = document.querySelector('#submit')
  button.addEventListener('click', submit)
  const addButtons = document.querySelectorAll('.add')
  addButtons[0].onclick = () => addItem('ingredients')
  addButtons[1].onclick = () => addItem('instructions')
}

function addItem(type, value){
  const list = document.querySelector(`#${type}-list`)
  const input = document.querySelector(`#${type}`)
  const item = document.createElement('li')
  if(typeof value === 'undefined') { 
    item.innerText = input.value
  }
  else{
    item.innerText = value
  }

  const deleteBtn = document.createElement('button')
  deleteBtn.type = 'button'
  deleteBtn.innerText = 'X'
  deleteBtn.classList.add('delete')
  item.appendChild(deleteBtn)
  list.appendChild(item)
  deleteBtn.onclick = () => deleteBtn.parentElement.remove()
  input.focus()
  input.select()
}

function buildTable(recipe){
  //building table for the recipe
  const table = document.createElement('table')
  recipes.appendChild(table)
  table.dataset.id =  recipe['_id']
  for(let i = 0; i < 3; i++){
    table.appendChild(document.createElement('tr'))
  }
  rows = table.querySelectorAll('tr')
    
  //fill rows w/ data
  const nameTH = document.createElement('th')
  nameTH.colSpan = 3
  nameTH.innerText = recipe['recipeName']
  rows[0].appendChild(nameTH)

  const timeTD = document.createElement('td')
  timeTD.innerText = `Cook time: ${recipe['cookTime']}`
  timeTD.classList.add('timeTd')
  const diffTD = document.createElement('td')
  diffTD.innerText = `Difficulty: ${recipe['difficulty']}`

  const buttonTD = document.createElement('td'),
        deleteBtn = document.createElement('button'),
        editBtn = document.createElement('button')

  deleteBtn.type = 'button'
  deleteBtn.innerText = 'X'
  deleteBtn.classList.add('delete')
  deleteBtn.addEventListener('click', async (event) => { 
    deleteBtn.closest('table').remove()
    const json = { _id : table.dataset.id }
    console.log(json)
    const response = await fetch('/remove', 
      {headers:  {'Content-Type' : 'application/json'},
        method :'POST', 
        body : JSON.stringify(json)} )
  })

  editBtn.type = 'button'
  editBtn.innerText = 'Edit Recipe'
  editBtn.classList.add('edit')
  editBtn.addEventListener('click', async (event) => { 
    //change the form to an edit form
    const form = document.querySelector('form'),
        submitBtn = form.querySelector('#submit'),
        heading = form.querySelector('h2')
    form.dataset.id = table.dataset.id
    submitBtn.dataset.action = "edit" 
    submitBtn.innerText = "Submit changes"
    heading.innerText = `Editing recipe for ${recipe['recipeName']}:`

    //prefill the fields with the current data
    const inputs =  form.getElementsByTagName('input')    
    inputs[0].value = recipe['recipeName']
    inputs[1].value = recipe['cookTime']
    for(let ingredient of recipe['ingredients']){
      addItem('ingredients', ingredient)
    }
    for(let step of recipe['instructions']){
      addItem('instructions', step)
    }
  })

  
  buttonTD.classList.add('buttonTD')
  buttonTD.appendChild(editBtn)
  buttonTD.appendChild(deleteBtn)
  
  rows[1].appendChild(diffTD)
  rows[1].appendChild(timeTD)
  rows[1].appendChild(buttonTD)

  const ingredientList = document.createElement('ul')
  for (let ingredient of recipe['ingredients']){
    const item = document.createElement('li')
    item.innerText = ingredient
    ingredientList.appendChild(item)
  }
  const ingredientTD = document.createElement('td')
  ingredientTD.appendChild(ingredientList)
  rows[2].appendChild(ingredientTD)

  const instructList = document.createElement('ol')
  for (let step of recipe['instructions']){
    const item = document.createElement('li')
    item.innerText = step
    instructList.appendChild(item)
  }
  const instructTD = document.createElement('td')
  instructTD.colSpan = 2
  instructTD.appendChild(instructList)
  rows[2].appendChild(instructTD)
  return table
}