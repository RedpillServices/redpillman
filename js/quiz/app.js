/* global $,document,console,quizMaster */
$(document).ready(function() {
	
	$(document).on("pageshow", "#quizPage", function() {
		console.log("Page show");
		//initialize the quiz
                
                                /*  db.transaction(function(tx) {
            tx.executeSql("DELETE FROM calculator;");
        });
                               db.transaction(function(tx) {
            tx.executeSql("DROP TABLE calculator;");
        });*/
           
                
		quizMaster.execute("q1.json", ".quizdisplay", function(result) {	
		});
	});

});