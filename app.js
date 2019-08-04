// 1. create architacture and module
// 2.



// Budget Controller
var budgetController = (function() {

    function Expences(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    function Income(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };


    var data = {
        allItem: {
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

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItem[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function(type, des, val) {
            if (data.allItem[type].length > 0){
                var ID = data.allItem[type][data.allItem[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if (type === 'exp') {
                var newItem = new Expences(ID, des, val);
            } else if (type === 'inc') {
                var newItem = new Income(ID, des, val);
            };

            data.allItem[type].push(newItem);

            return newItem;

        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage 
            };
        },

        calculateBudget: function() {
            // calculate sum of income or expenceses
            calculateTotal('inc');
            calculateTotal('exp');

            // calculate budget
            data.budget = data.totals.inc - data.totals.exp;
            // calculate percentage
            if (data.totals.inc > 0) {
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            } else {
                data.percentage = -1;
            }
        }, 

        testing: function() {
            console.log(data);
        }
    };

})();


// UI Controller
var UIController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expencesContainer: '.expenses__list'
    };
        
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        getDOMstrings: function() {
            return DOMstrings;
        },

        addListItem: function(obj, type) {

            // create HTML string with placeholder
            var html, newHtml, element;

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expencesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            // insert html into DOM 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fields.forEach(function(element) {
                element.value = "";
            });

            fields[0].focus();
        },

        displayBudget: function(obj) {
            console.log(obj);
            document.querySelector('.budget__value').textContent = obj.budget;
            document.querySelector('.budget__income--value').textContent = obj.totalInc;
            document.querySelector('.budget__expenses--value').textContent = obj.totalExp;

            if(obj.percentage === -1){
                document.querySelector('.budget__expenses--percentage').textContent = '---';
            } else {
                document.querySelector('.budget__expenses--percentage').textContent = obj.percentage + '%';

            }
        }
        
    };

})();


// Global APP Controller
var controller = (function(budgetCtrl, UICtrl){

    //initilization
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            };
        });
    };

    var updateBudget = function() {

        // calculate budget
        budgetCtrl.calculateBudget();
        // get budget
        var budget = budgetCtrl.getBudget();
        // display budget on UI 
        UICtrl.displayBudget(budget);

    };

    var ctrlAddItem = function() {
        var input, newItem;

        // 1. get field inputs
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0){

            // 2. add new item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. add item to UI controller
            UICtrl.addListItem(newItem, input.type);
            // 4. clear the input fields
            UICtrl.clearFields();
            // 5. update budget
            updateBudget();
        }
        
    };
    
    return {
        init: function() {
            setupEventListeners();
            console.log('App started.');
            UIController.displayBudget({
                totalInc: 0,
                totalExp:0,
                budget: 0,
                percentage: -1
            })
        }
    }

    

})(budgetController, UIController);

controller.init();