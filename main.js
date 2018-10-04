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
    var currentStockPrice = currentStock[1].toFixed(2);
    var stockUpdatedTime = Date.now();
    var stockGraph = stockData.stockGraph || [];

    if(stockData[currentStockName] == undefined){
        var tempName = currentStockName;
        var tempPrice = currentStockPrice;

        stockData[tempName] = {
            name: currentStockName ,
            price: currentStockPrice,
            time: stockUpdatedTime,
            stockGraph: stockGraph
        }
        createStockElement(currentStockName,currentStockPrice);
    } else {
        var previousPrice = stockData[currentStockName]["price"];
        stockData[currentStockName]["price"] = currentStockPrice;
        stockData[currentStockName]["time"] = stockUpdatedTime;
        stockData[currentStockName]["stockGraph"].push(currentStockPrice);
        if(stockData[currentStockName]["stockGraph"].length > 15){
            stockData[currentStockName]["stockGraph"].splice(0,1);
        }
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
    var graph = document.createElement("div");

    name.setAttribute("id", stockName + "_name");
    price.setAttribute("id", stockName + "_price");
    time.setAttribute("id", stockName + "_time");
    graph.setAttribute("id", stockName + "_graph");
    graph.onclick = function(){
        populateGraph(stockName);
    }

    name.classList.add("stock-name");
    price.classList.add("stock-price");
    time.classList.add("stock-time");
    graph.classList.add("stock-graph");
    container.classList.add("stock");
    container.setAttribute("id", stockName);
    content.classList.add("content");

    name.innerHTML = stockName;
    price.innerHTML = stockPrice;
    time.innerHTML = "Few seconds ago";

    container.appendChild(name);
    container.appendChild(price);
    container.appendChild(time);
    container.appendChild(graph);
    wrapper.appendChild(container);
}

function updateStockElement(stockName, stockPrice, classChange) {
    document.getElementById(stockName + "_price").innerHTML = stockPrice;
    document.getElementById(stockName + "_price").classList = [];
    document.getElementById(stockName + "_price").classList.add("stock-price");
    document.getElementById(stockName + "_price").classList.add(classChange);
    document.getElementById(stockName + "_time").innerHTML = "Few seconds ago";

    if(stockData[stockName].stockGraph.length > 2){
        document.getElementById(stockName + "_graph").innerHTML = "View Graph";
    }
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

function populateGraph(stockName) {
    var graphStockName = stockName + "_graph"
    var graphElement = document.getElementById(graphStockName);

    var abc = stockData[stockName].stockGraph;
    $(graphElement).sparkline(abc);
}
init();