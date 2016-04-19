document.onkeydown = checkKey;

var seed = window.location.search.replace("?", "");
if (seed == "")
    seed = Math.random().toString(36).substr(2, 5);
console.log(seed);
Math.seedrandom(seed);
// size of game field in blocks
// and it is inital value of number for player
var size = 10;
// player position and current number
var o = {
    'x': 5,
    'y': 5,
    'value': size
};
// array for storing field values
var items = new Array(size);
// preinitialising it
for (var i = 0; i < size; i++) {
    items[i] = new Array(size);
}
// block generates op randomly
var ops = ["+", "-", "*", "/"];
// chances of appering op in block
var op_chances = [0.4, 0.4, 0.15, 0.05];
var op_styles = {
    "+" : "op_add",
    "-" : "op_sub", 
    "*" : "op_mul",
    "/" : "op_div"
};
// value, which you must reach for win
var finish = Math.floor(Math.random() * 1000);
var lose_max = 9999;
// number of player steps on field
var steps = 0;


// filling field randomly
for (var i = 0; i < size; i++)
    for (var j = 0; j < size; j++) {
        reborn_block(i, j);
    }

function reborn_block(i, j) {
    
    var lucky;
    for (lucky = 0; lucky < ops.length - 1; lucky++)
    if (Math.random() <= op_chances[lucky]) break;
    console.log(lucky);
    var sign_index = lucky;//Math.floor(Math.random() * ops.length);
    var item = {
        'sign': ops[sign_index],
        'number': 1 + Math.floor(Math.random() * (size-1)),
        'locked': false,
        'lives': 3
    };
    items[i][j] = item;
}

// parsing GET params
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// scan field for blocks with non integer result relatively current value
function lock(value) {
    for (var i = 0; i < size; i++)
        for (var j = 0; j < size; j++) {
            var item = items[j][i];
            var n = o.value;
            var result = step(n, item);
            if (!Number.isInteger(result) ||
                result < 0 || result > lose_max) {
                items[j][i].locked = true;
            } else
                items[j][i].locked = false;
        }
}

function step(value, item) {
    switch (item.sign) {
        case "+":
            value += item.number;
            break;
        case "-":
            value -= item.number;
            break;
        case "*":
            value *= item.number;
            break;
        case "/":
            value /= item.number;
            break;

    }
    return value;
}

function isOutOfBounds(pos) {
    if (pos.x >= size || pos.y >= size ||
        pos.x < 0 || pos.y < 0)
        return true;
    else return false;
}
/*function isStepValid(n,item)
	{
		if 	( !Number.isInteger(result) ||
					  result < 0) 
	}*/
function checkKey(e) {

    e = e || window.event;
    var oNext = Object.assign({}, o);
    if (e.keyCode == '38') {
        // up arrow
        oNext.x--;
    } else if (e.keyCode == '40') {
        // down arrow
        oNext.x++;
    } else if (e.keyCode == '37') {
        // left arrow
        oNext.y--;
    } else if (e.keyCode == '39') {
        // right arrow
        oNext.y++;
    }
    else return;
    if (items[oNext.y][oNext.x].locked == false && !isOutOfBounds(oNext)) {
        var oOld = Object.assign({}, o);
        o = oNext;
        o.value = step(o.value, items[o.y][o.x]);
        lock(o.value);
        var item = items[oOld.y][oOld.x];
        item.locked = true;
        item.lives--;
        if (item.lives == 0) reborn_block(oOld.y, oOld.x);
        steps++;
    }
    //else console.log("STOP");
    document.getElementById("canvas").innerHTML = updateHTML();
    document.getElementById("steps").innerHTML = steps;
    if (!checkFinish())
        checkLose();
}

function checkFinish() {
    if (finish == o.value) {
        document.getElementById("win").innerHTML = "<h1>YOU WIN!</h1><a href='index.html'><center>restart</center></a>";
        document.onkeydown = null;
        return true;
    } else return false;
}

function checkLose() {
    if (lockedOrNotExists(o.y + 1, o.x) &&
        lockedOrNotExists(o.y - 1, o.x) &&
        lockedOrNotExists(o.y, o.x + 1) &&
        lockedOrNotExists(o.y, o.x - 1) ||
        o.value > lose_max) {
        document.getElementById("win").innerHTML = "<h1>YOU LOSE!</h1><a href='index.html'><center>restart</center></a>";
        document.onkeydown = null;
        document.getElementById("canvas").className += " blur";
        return true;
    } else return false;
}

function lockedOrNotExists(y, x) {
    if (isOutOfBounds({
        y, x
    }))
        return true;
    else
    if (items[y][x].locked)
        return true;
    return false;
}

function updateHTML() {
    var c = "<table>";
    for (var i = 0; i < size; i++) {
        c += "<tr>";
        for (var j = 0; j < size; j++) {
            c += "<td>";
            if (o.x == i && o.y == j) {
                c += "<div class='block selected'>";
                c += o.value;
            } else {
                var locked = items[j][i].locked ? "locked" : "";
                var lives = "lives"+ items[j][i].lives;
                var opstyle = op_styles[items[j][i].sign];
                //switch ()
                c += "<div class='block " 
                + locked + " " 
                + lives + " "
                + opstyle + "'>";
                c += items[j][i].sign + items[j][i].number;
            }
            c += "</div>";
            c += "</td>";
        }
        c += "</tr>";
    }
    c += "</table>";
    return c;
}

function gen_seedlink() {
    document.getElementById("seeddiv").innerHTML =  "xotonic.github.io/?" + seed;
}