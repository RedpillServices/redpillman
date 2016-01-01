/* global $,window */
$(document).ready(function() {

    document.addEventListener("deviceready", onDeviceReady, false);

    db = window.openDatabase('redpillman', '1.0', 'redpillman', 200000);

    function onDeviceReady() {
        //Populate the databse
        db.transaction(function(tx) {
            tx.executeSql('CREATE TABLE IF NOT EXISTS calculator (id INTEGER NOT NULL PRIMARY KEY, leadership UNSIGNED INTEGER, status UNSIGNED INTEGER, wealth UNSIGNED INTEGER, social UNSIGNED INTEGER, women UNSIGNED INTEGER, dominance UNSIGNED INTEGER)');
        });
        //db.transaction(populateDB, errorCB, successCB);
        //Override the back button functionality
        document.addEventListener('backbutton', onBack, false);
    }
});

var quizMaster = (function() {

    var name;
    var data;
    var loaded = false;
    var displayDom;

    function nextHandler(e) {
        e.preventDefault();

        getUserStatus(function(status) {

            if (typeof status === 'undefined') {
                status = {question: 1};
            }
            if (status.question >= 1) {
                var checked = $("input[type=radio]:checked", displayDom);
                if (checked.length === 0) {
                    //for now, an ugly alert
                    window.alert("Please answer the question!");
                    return;
                }
                else {
                    value = checked.val();
                    var insertData = data.questions[status.question].answers[value];
                    storeUserStatus(insertData);
                }
            }
            status.question++;
            displayQuiz(status);
        });
    }

    function displayQuiz(status) {

        getQuiz(function(current) {
            var html;
            if (current.state === "inprogress") {

                html = "<h2>" + current.question.question + "</h2><form><div data-role='fieldcontain'><fieldset data-role='controlgroup'>";
                //for(var i=0; i<current.question.answers.length; i++) {
                var i = 0;
                for (var key in current.question.answers) {
                    html += '<input type="radio" name="quizMasterAnswer" id="quizMasterAnswer_' + i + '" value="' + key + '"/><label for="quizMasterAnswer_' + i + '">' + key + '</label>';
                    i++;
                }
                html += "</fieldset></div></form>" + nextButton();
                displayDom.html(html).trigger('create');
            } else if (current.state === "complete") {
                sortResults(function(score) {
                    console.log("SCORE");
                    console.log(score);
                    html = "<h2>Calculation Complete</h2>"
                    if(score < 90) {
                    if(score < .25) {
                        var mission = "not on";
                    }
                    else if(score >= .25 && score < .50) {
                        var mission = "somewhat on";
                    }
                    else if (score >= .50 && score < .75) {
                        var mission = "working hard on";
                    }
                    else if (score >= .75) {
                        var mission = "achieving";
                    }
                    html = html + "<p>You are " + mission + " your mission right now." + "</p>";
                }
                else if(score > 90) {
                    html = html + "<p>You truly are a Redpill Man." + "</p>";
                }
                
                html = html + "<img id='redpill' src='redpill.png'>";
                displayDom.html(html).trigger('create');
                    
            //Remove previous if there...
            //Note - used click since folks will be demoing in the browser, use touchend instead
            displayDom.off("click", ".quizMasterNext", nextHandler);
            //Then restore it
            displayDom.on("click", ".quizMasterNext", nextHandler);
            //console.log(status);
                });
                
                
            }
        });
    }

    function sortResults(valueResult) {
        db.transaction(function(tx) {
            tx.executeSql('SELECT leadership, status, wealth, social, women, dominance FROM calculator;', [],
                    function(tx, results) {
                        //var row = results.rows.item(0);
                        //console.log("ITEMS");
                        //console.log(results.rows);
                        var leadership = 0;
                        var status = 0;
                        var wealth = 0;
                        var social = 0;
                        var women = 0;
                        var dominance = 0;
                        length = results.rows.length
                        for (i = 1; i < length; i++) {
                            var item = results.rows.item(i)
                            //console.log(item);
                            leadership = leadership + item['leadership'];
                            status = status + item['status'];
                            wealth = wealth + item['wealth'];
                            social = social + item['social'];
                            women = women + item['women'];
                            dominance = dominance + item['dominance'];
                        }

                        var finalValues = {leadership: leadership, status: status, wealth: wealth, social: social, women: women, dominance: dominance};

                        calcValue = calculateResults(finalValues);


                        valueResult(calcValue);
                    },
                    function(err) {
                        console.log(err);
                        returnValue();
                    });
        });
    }

    function calculateResults(finalValues) {
        //console.log(finalValues);
        //console.log(data.questions);
        var leadership = 0;
        var status = 0;
        var wealth = 0;
        var social = 0;
        var women = 0;
        var dominance = 0;
        for (i = 0; i < data.questions.length; ++i) {
            //console.log(data.questions[i].answers);
            for (var answer in data.questions[i].answers) {
                //console.log(answer);
                //console.log(data.questions[i].answers[answer]);
                for (q = 0; q < data.questions[i].answers[answer].length; q++) {
                    //console.log(data.questions[i].answers[answer][q]);
                    if (q === 0) {
                        leadership = leadership + data.questions[i].answers[answer][q];
                    }
                    else if (q === 1) {
                        status = status + data.questions[i].answers[answer][q];
                    }
                    else if (q === 2) {
                        wealth = wealth + data.questions[i].answers[answer][q];
                    }
                    else if (q === 3) {
                        social = social + data.questions[i].answers[answer][q];
                    }
                    else if (q === 4) {
                        women = women + data.questions[i].answers[answer][q];
                    }
                    else if (q === 5) {
                        dominance = dominance + data.questions[i].answers[answer][q];
                    }
                }

            }


        }

        focusValue = localStorage.getItem("focusValue");
        console.log(focusValue);
        
        var finalLeadership = finalValues.leadership / leadership;
        var finalStatus = finalValues.status / status;
        var finalWealth = finalValues.wealth / wealth;
        var finalSocial = finalValues.social / social;
        var finalWomen = finalValues.women / women;
        var finalDominance = finalValues.dominance / dominance;
        if (focusValue === "radio-choice-1") {
            // Dating
            var rating = (((finalSocial * 4) + (finalWomen * 5) + (finalLeadership * 3) + (finalWealth * 2)+ (finalStatus * 3) + (finalDominance * 3)) / 6);
        }
        else if (focusValue === "radio-choice-2") {
            // Financial/Professional
            var rating = (((finalSocial * 3) + (finalWomen * 1) + (finalLeadership * 4) + (finalWealth * 3) + (finalStatus * 2) + (finalDominance * 3)) / 6);
        }
        else if (focusValue === "radio-choice-3") {
            // Education/Development
            var rating = (((finalSocial * 2) + (finalWomen * 2) + (finalLeadership * 4) + (finalWealth * 2) + (finalStatus * 1) + (finalDominance * .5)) / 6);
        }
        else if (focusValue === "radio-choice-4") {
            // Social Status
            var rating = (((finalSocial * 3) + (finalWomen * 2) + (finalLeadership * 2) + finalWealth + (finalStatus * 3) + (finalDominance * .5)) / 6);
        }

        console.log("LEADERSHIP");
        console.log(leadership);
        console.log("STATUS");
        console.log(status);
        console.log("WEALTH");
        console.log(wealth);
        console.log("SOCIAL");
        console.log(social);
        console.log("WOMEN");
        console.log(women);
        console.log("DOMINANCE");
        console.log(dominance);
        
        console.log("RATING");
        console.log(rating);

        return rating;
    }

    function getKey() {
        return "quizMaster_" + name;
    }

    function getQuestion(x) {
        //console.log(data.questions);
        return data.questions[x];
    }

    function getQuiz(returnQuiz) {
        //Were we taking the quiz already?
        //var status = getUserStatus();

        getUserStatus(function(status) {

            console.log("QUIZ");
            /*       getUserStatus(function(status) {
             });*/
            if (typeof status === 'undefined') {
                status = {question: -1};
            }
            ;
            //If a quiz doesn't have an intro, just go right to the question
            if (status.question === -1) {
                status.question = 1;
                //storeUserStatus(status);
            }

            var result = {
                currentQuestionNumber: status.question
            };

            if (status.question < data.questions.length) {
                result.state = "inprogress";
                result.question = getQuestion(status.question);
            } else {
                result.state = "complete";
                result.correct = 0;
            }
            returnQuiz(result);
        });
    }

    function getUserStatus(returnCallback) {
        db.transaction(function(tx) {
            tx.executeSql('SELECT id FROM calculator ORDER by id DESC LIMIT 1;', [],
                    function(tx, results) { //querySuccess callback
                        if (typeof results.rows === "undefined") {
                            var status = {
                                question: 1,
                            };

                            returnCallback(status)
                        }
                        else {
                            var row = results.rows.item(0);
                            console.log(row['id']);
                            var status = {
                                question: row['id'],
                            };
                            status.question = status.question + 1;
                            returnCallback(status);
                        }
                    },
                    function(err) { //error callback
                        console.log("ERROR");
                        console.log(err);
                        returnCallback();
                    });
        });
    }

    function nextButton() {
        return "<a href='' class='quizMasterNext' data-role='button'>Next</a>";
    }

    function storeUserStatus(s) {

        db.transaction(function(tx) {
            tx.executeSql("INSERT INTO calculator (leadership, status, wealth, social, women, dominance) VALUES  (?, ?, ?, ?, ?, ?)", [s[0], s[1], s[2], s[3], s[4], s[5]], function(success) {

            }),
                    function(err) {

                    };
        });
    }

    return {
        execute: function(url, dom, cb) {
            //We cache the ajax load so we can do it only once 
            if (!loaded) {

                $.get(url, function(res, code) {
                    //Possibly do validation here to ensure basic stuff is present
                    name = url;
                    data = res;
                    displayDom = $(dom);
                    //console.dir(res);
                    loaded = true;
                    displayQuiz(cb);
                }, "json");

            } else {
                displayQuiz(cb);
            }
        }
    };
}());