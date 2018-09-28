var stockData = {};

function openWSConnection() {
    var webSocketURL = null;
    webSocketURL = "ws://stocks.mnet.website";

    try {
        document.getElementById("wrapper").classList.add("loader");
        
        webSocket = new WebSocket(webSocketURL);
        webSocket.onopen = function(openEvent) {

        };
        webSocket.onclose = function (closeEvent) {
            document.getElementsByClassName("network-error")[0].style.display = "block";
            document.getElementsByClassName("network-error")[0].innerHTML = "Connection closed";
        };
        webSocket.onerror = function (errorEvent) {
            document.getElementsByClassName("network-error")[0].style.display = "block";
            document.getElementsByClassName("network-error")[0].innerHTML = "Connection Error"
        };
        webSocket.onmessage = function (messageEvent) {
            document.getElementById("wrapper").classList.remove("loader");
            renderStocks(JSON.parse(messageEvent.data));
        };
    } catch (exception) {
        document.getElementsByClassName("network-error")[0].style.display = "block";
        document.getElementsByClassName("network-error")[0].innerHTML = "Connection Error"
        console.error(exception);
    }
}

function renderStocks(messageData) {

    for(var i = 0; i < messageData.length; i++){
    var currentStock = messageData[i];

    var currentStockName = currentStock[0];
    var currentStockPrice = currentStock[1];
    var stockUpdatedTime = Date.now();

    if(stockData[currentStockName] == undefined){
        var tempName = currentStockName;
        var tempPrice = currentStockPrice;

        stockData[tempName] = {
            name: currentStockName ,
            price: currentStockPrice,
            time: stockUpdatedTime
        }
        createStockElement(currentStockName,currentStockPrice);
    } else {

        var previousPrice = stockData[currentStockName]["price"];
        stockData[currentStockName]["price"] = currentStockPrice;
        stockData[currentStockName]["time"] = stockUpdatedTime;
        var classChange;
        if(previousPrice < currentStockPrice) {
            classChange = "green";
        }
        else {
            classChange = "red"
        }
            updateStockElement(currentStockName, currentStockPrice, classChange);
        }
    }
}

function createStockElement(stockName, stockPrice) {
    var wrapper = document.getElementById("wrapper");
    var content = document.createElement("div");
    var container = document.createElement("div");
    var name = document.createElement("div");
    var price = document.createElement("div");
    var time = document.createElement("div");

    name.setAttribute("id", stockName + "_name");
    price.setAttribute("id", stockName + "_price");
    time.setAttribute("id", stockName + "_time");

    name.classList.add("stock-name");
    price.classList.add("stock-price");
    time.classList.add("stock-time");
    container.classList.add("stock");
    container.setAttribute("id", stockName);
    content.classList.add("content");

    name.innerHTML = stockName;
    price.innerHTML = stockPrice;
    time.innerHTML = "Few seconds ago";

    container.appendChild(name);
    container.appendChild(price);
    container.appendChild(time);
    wrapper.appendChild(container);
}

function updateStockElement(stockName, stockPrice, classChange) {
    document.getElementById(stockName + "_price").innerHTML = stockPrice;

    document.getElementById(stockName + "_price").classList = [];
    document.getElementById(stockName + "_price").classList.add("stock-price");
    document.getElementById(stockName + "_price").classList.add(classChange);

    document.getElementById(stockName + "_time").innerHTML = "Few seconds ago";
}

function init(){
    openWSConnection();

    setInterval(function(){
        var localStockNames = Object.keys(stockData);
        for (var j = 0; j < localStockNames.length; j++ ){
            var stockName = localStockNames[j];
            var stockTime = stockData[stockName]["time"];
            var presentTime = Date.now();
            renderTime(stockName, presentTime - stockTime);
        }
    }, 60000);
}

function renderTime(stockName, time){
    if(time >= 0 && time < 60000) {
        document.getElementById(stockName + "_time").innerHTML = "Few seconds ago";

    }else if(time >= 60000 && time < 3600000) {
        document.getElementById(stockName + "_time").innerHTML = Math.floor(time/(1000 * 60)) + " minutes ago";
    } else {
        document.getElementById(stockName + "_time").innerHTML = Math.floor(time/(1000 * 60 * 60)) + " hours ago";
    }
}

init();