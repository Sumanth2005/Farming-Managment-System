/* =========================================================
   WATER REQUIREMENT CALCULATOR
========================================================= */

function calculateWater(animalName, category){

    let count = parseInt(document.getElementById("animalCount").value);

    if(isNaN(count) || count <= 0){
        alert("Enter a valid number.");
        return;
    }

    let litres = 0;

    animalName = animalName.toLowerCase();

    if(category.toLowerCase()=="dairy"){

        if(animalName.includes("cow"))
            litres = count * 70;

        else if(animalName.includes("buffalo"))
            litres = count * 80;

        else if(animalName.includes("goat"))
            litres = count * 10;

        else
            litres = count * 50;

    }

    else if(category.toLowerCase()=="poultry"){

        if(animalName.includes("chicken"))
            litres = count * 0.30;

        else if(animalName.includes("turkey"))
            litres = count * 0.60;

        else if(animalName.includes("duck"))
            litres = count * 0.50;

        else if(animalName.includes("goose"))
            litres = count * 0.70;

        else
            litres = count * 0.40;

    }

    else if(category.toLowerCase()=="fish"){

        litres = count * 2;

    }

    document.getElementById("waterResult").style.display="block";

    document.getElementById("waterResult").innerHTML =
    "<h3>💧 Daily Water Requirement</h3>" +
    "<br><b>"+count+
    "</b> "+animalName+
    "<br><br><span style='font-size:28px;color:#16a34a'>≈ "+
    litres.toFixed(1)+
    " Litres / Day</span>";

}

/* =========================================================
   FARM HELP DESK
========================================================= */

function sendQuestion(id){

    let input = document.getElementById("userQuestion");

    let q = input.value.trim();

    if(q=="")
        return;

    let area = document.getElementById("chatArea");

    area.innerHTML +=
    `<div class="user">${q}</div>`;

    let question = q.toLowerCase();

    let answer="Sorry, I couldn't understand your question.";

    if(question.includes("food") ||
       question.includes("eat") ||
       question.includes("feeding")){

        answer="🍽 <b>Food:</b><br>"+animalData.food;
    }

    else if(question.includes("house") ||
            question.includes("housing") ||
            question.includes("shed")){

        answer="🏠 <b>Housing:</b><br>"+animalData.housing;
    }

    else if(question.includes("purpose")){

        answer="🎯 "+animalData.purpose;
    }

    else if(question.includes("benefit")){

        answer="✅ "+animalData.benefit;
    }

    else if(question.includes("disease")){

        answer="🩺 "+animalData.diseases;
    }

    else if(question.includes("care")){

        answer="❤️ "+animalData.care;
    }

    else if(question.includes("production")){

        answer="🥚 "+animalData.production;
    }

    else if(question.includes("weight")){

        answer="⚖ "+animalData.weight;
    }

    else if(question.includes("life")){

        answer="📅 "+animalData.lifespan;
    }

    else if (
    question.includes("investment") ||
    question.includes("cost") ||
    question.includes("capital") ||
    question.includes("price") ||
    question.includes("start")
){

    answer = "💸 <b>Investment Required:</b><br>" + animalData.investment;
}
    

    else if (
    question.includes("profit") ||
    question.includes("money") ||
    question.includes("income") ||
    question.includes("earn") ||
    question.includes("earning") ||
    question.includes("make money") ||
    question.includes("how much can i make") ||
    question.includes("how much money")
){

    answer = "💰 <b>Estimated Profit:</b><br>" + animalData.profit;
}
    

    else if(question.includes("water")){

        answer="💧 Use the Water Requirement Calculator above.";
    }

    else if(question.includes("hello") ||
            question.includes("hi")){

        answer="👋 Hello! Ask me anything about this animal.";
    }

    else{

        answer =
        "I can answer questions about:<br><br>"+
        "🍽 Food<br>"+
        "🏠 Housing<br>"+
        "🩺 Diseases<br>"+
        "❤️ Care Tips<br>"+
        "📈 Production<br>"+
        "⚖ Weight<br>"+
        "📅 Lifespan<br>"+
        "💰 Investment<br>"+
        "💵 Profit<br>"+
        "💧 Water Requirement";
    }

    setTimeout(function(){

        area.innerHTML +=
        `<div class="bot">${answer}</div>`;

        area.scrollTop=area.scrollHeight;

    },500);

    input.value="";

}