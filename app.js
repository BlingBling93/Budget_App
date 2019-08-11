// Budget Controller
var budgetController = (function() {

    function Expense(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
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
                var newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                var newItem = new Income(ID, des, val);
            };

            data.allItem[type].push(newItem);
            console.log(data.allItem.exp);

            return newItem;

        },

        deleteItem: function(type, id){
            var ids, index;
            ids = data.allItem[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
               data.allItem[type].splice(index, 1); 
            }


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
            // calculate sum of income or expenses
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

        calculatePercentages: function() {
            
            data.allItem.exp.forEach(function(cur) {
               cur.calcPercentage(data.totals.inc);
            });
        },
        
        
        getPercentages: function() {
            var allPerc = data.allItem.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
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
        expensesContainer: '.expenses__list',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        monthLabel:'.budget__title--month'
    };

    var formatNumber = function(num, type) {
        // inc '+' and epx '-'
        // add commer between thounds
        // with 2 decimal
        var num, numSplit, int, dec;
        num = Math.abs(num).toFixed(2);
        numSplit = num.split('.');

        int = numSplit[0];

        commaNumber = int.length % 3;
        if (int.length > 3) {
            if (commaNumber === 0) {
                commaNumber = 3;
                while(commaNumber < int.length) {
                    int = int.substring(0, commaNumber) + ',' + int.substring(commaNumber, int.length);
                    commaNumber += 4;
                }
            } else {
                for (var i = 0; i < (int.length / 3) - 1; i++) {
                    int = int.substring(0, commaNumber) + ',' + int.substring(commaNumber, int.length);
                    commaNumber += 4;
                }
            }
        }

        dec = numSplit[1];

        return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
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

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            // insert html into DOM 
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fields.forEach(function(element) {
                element.value = "";
            });

            fields[0].focus();
        },

        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector('.budget__value').textContent = formatNumber(obj.budget, type);
            document.querySelector('.budget__income--value').textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector('.budget__expenses--value').textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage === -1){
                document.querySelector('.budget__expenses--percentage').textContent = '---';
            } else {
                document.querySelector('.budget__expenses--percentage').textContent = obj.percentage + '%';

            }
        },

        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(fields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },

        displayMonth: function() {
            var now, year, month, months;

            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ['Jan.', 'Feb.', 'March', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sep.',
                      'Oct.', 'Nov', 'Dec'];

            document.querySelector(DOMstrings.monthLabel).textContent = months[month] + ' ' + year;

        },

        changeType: function() {

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

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

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);

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

    var ctrlDeleteItem = function(event) {
        var itemID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete the item from data structure
            budgetCtrl.deleteItem(type, ID);
            // delete item from UI
            UICtrl.deleteListItem(itemID);

            // update and show the new budget 
            updateBudget();
        }
    };


    
    var updatePercentages = function() {
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };

        
    
    
    return {
        init: function() {
            
            console.log('App started.');
            UIController.displayBudget({
                totalInc: 0,
                totalExp:0,
                budget: 0,
                percentage: -1
            });

            setupEventListeners();
            UIController.displayMonth();
        }
    }

    

})(budgetController, UIController);

controller.init();