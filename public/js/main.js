// FRONT-END (CLIENT) JAVASCRIPT HERE

const submit = async function( event ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const nameInput = document.querySelector( '#recipe-name' ),
        timeInput = document.querySelector('#cook-time'),
        ingredientLi = document.querySelectorAll('#ingredients-list > li'),
        instructionLi = document.querySelectorAll('#instructions-list > li')
  
  const listOfIngredients = []
  for (let li of ingredientLi){
    text = li.innerText
    listOfIngredients.push(text.substring(0,text.length-1))
  }

  const listOfInstructions = []
  for (let li of instructionLi){
    text = li.innerText
    listOfInstructions.push(text.substring(0,text.length-1))
  }

  const json = { recipeName: nameInput.value, 
    ingredients : listOfIngredients,
    instructions : listOfInstructions,  
    cookTime : timeInput.value }
  
  const body = JSON.stringify( json )
  console.log(`Sending ${JSON.stringify( json )}`)
  const response = await fetch( '/submit', {
    headers:  {'Content-Type' : 'application/json'},
    method:'POST',
    body : JSON.stringify(json)
  })
  const ingredientList = document.querySelector("#ingredients-list")
  const instructionList = document.querySelector("#instructions-list")
  ingredientList.innerHTML = ''
  instructionList.innerHTML = ''

  const list = await response.json()
  console.log(list)
  buildTable(list)
}

window.onload = function() {
  const button = document.querySelector('#submit')
  button.onclick = submit
  const addButtons = document.querySelectorAll('.add')
  addButtons[0].onclick = () => addItem('ingredients')
  addButtons[1].onclick = () => addItem('instructions')
}

function addItem(type){
  const list = document.querySelector(`#${type}-list`)
  const input = document.querySelector(`#${type}`)
  const item = document.createElement('li')
  item.innerText = input.value

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

const getRecipes = async function(){
  const response = await fetch('/docs', {method :'GET'})
  const list = await response.json()
  console.log(list)
  buildTable(list)
  
}

async function deleteRecipe(recipeName){
  const response = await fetch('/delete', {method :'POST', body : JSON.stringify(recipeName)})
  if(!response.ok){
    console.log("Error deleting recipe")
  }
}

document.addEventListener("DOMContentLoaded", getRecipes)

function buildTable(list){
  const recipes = document.querySelector('section.box')
  // clear all the tables but keep "All Recipes" heading
  recipes.replaceChildren(document.getElementById('all-recipes'))

  for(let recipe of list) {
    //building table for the recipe
    const table = document.createElement('table')
    recipes.appendChild(table)

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

    const deleteTD = document.createElement('td'),
          deleteBtn = document.createElement('button')
    deleteBtn.type = 'button'
    deleteBtn.innerText = 'X'
    deleteBtn.classList.add('delete')
    deleteTD.classList.add('deleteTd')
    deleteTD.appendChild(deleteBtn)
    deleteBtn.onclick = function(){ 
      deleteBtn.closest('table').remove()
      deleteRecipe(recipe['recipeName'])
    }
    rows[1].appendChild(diffTD)
    rows[1].appendChild(timeTD)
    
    rows[1].appendChild(deleteTD)

    
    const ingredientList = document.createElement('ul')
    for (let ingredient of recipe['ingredients']){
      const item = document.createElement('li')
      item.innerText = ingredient
      ingredientList.appendChild(item)
    }

    const instructList = document.createElement('ol')
    for (let step of recipe['instructions']){
      const item = document.createElement('li')
      item.innerText = step
      instructList.appendChild(item)
    }

    const ingredientTD = document.createElement('td')
    ingredientTD.appendChild(ingredientList)
    rows[2].appendChild(ingredientTD)

    const instructTD = document.createElement('td')
    instructTD.colSpan = 2
    instructTD.appendChild(instructList)
    rows[2].appendChild(instructTD)
  }
}