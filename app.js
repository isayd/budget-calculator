/*
Concepts:
    - Module Pattern
    - Closure
    - IIFE (Immediately Invoked Function Expressions)
    - Event listeners
    - Read data from HTML input types
    - Initialization function
    - Function constructors
    - DOM Manipulation
    - Clear HTML fields
    - querySelectorAll
    - for Each method
    - Convert list to an array
    - Simple and reusable functions with only one purpose
*/

// Module that handles budget data
var budgetController = (function (){

    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    
    var calculateTotal = function(type){
        
        var sum = 0;
        
        data.allItems[type].forEach(function(curr){
            sum = sum + curr.value;
        });
        
        data.totals[type] = sum;
    };
    
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type,des,val){
            var newItem, ID;
            
            // Create new ID
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else{
                ID = 0;
            }
      
            
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);
            }else if (type === 'inc'){
                newItem = new Income(ID,des,val);
            }
            
            //Push it into our data structure
            data.allItems[type].push(newItem);
            
            //Return the new element
            return newItem;
        },
        
        calculateBudget: function(){
          
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income that we spent
            if (data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else{
                data.percentage = -1;
            }
        },
        
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }  
        },
        
        testing: function(){
            console.log(data);
        }
    };
    
    
})();


// Module that take care of the User Interface
var userInterfaceController = (function() {
    
    // Central place for strings from DOM
    var domStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percemtageLabel: '.budget__expenses--percentage'
    };
    
    return {
        getInput: function(){
            return{
                type: document.querySelector(domStrings.inputType).value, // inc or exp
                description: document.querySelector(domStrings.inputDescription).value,
                value: parseFloat(document.querySelector(domStrings.inputValue).value)
            };
        },
        
        addListItem: function(obj,type){
            
            var html, newHTML, element;
            // Create HTML string with placeholder text
            
            if (type === 'inc'){
                element = domStrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div> </div>';
            } else if (type === 'exp'){
                element = domStrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div> <div class="item__percentage">21%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with some actual data
            newHTML = html.replace('%id%',obj.id);
            newHTML = newHTML.replace('%description%',obj.description);
            newHTML = newHTML.replace('%value%',obj.value);
            
            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHTML);
            
        },
        
        clearFields: function(){
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(domStrings.inputDescription + ',' + domStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current,index,array){
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj){
            
            document.querySelector(domStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(domStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(domStrings.expensesLabel).textContent = obj.totalExp;
           
            
            if (obj.percentage > 0){
                 document.querySelector(domStrings.percemtageLabel).textContent = obj.percentage + '%' ;
            } else {
                document.querySelector(domStrings.percemtageLabel).textContent = '---';
            }
            
        },
        
        getDomStrings: function(){
            return domStrings;
        }
        
     
    };
    
}());

// Module to connect Data and Interface
var controller = (function(budgetCtrl, uiCtrl){
    
    
    var setupEventListeners = function(){
        var dom = uiCtrl.getDomStrings(); 
        
        document.querySelector(dom.inputBtn).addEventListener('click',ctrlAddItem);
        
        document.addEventListener('keypress',function(event){
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();    
            }
        });     
    };
    
    var updateBudget = function(){
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        userInterfaceController.displayBudget(budget);
    }
  
    var ctrlAddItem = function(){
        var input, newItem;
        
        // 1. Get the filed input data        
        input = uiCtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            uiCtrl.addListItem(newItem,input.type);

            // 4. Clear fields
            uiCtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();
        }
    };
    
    return {
        init: function(){
            console.log('Application has started.');
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
    
})(budgetController, userInterfaceController);

controller.init();



