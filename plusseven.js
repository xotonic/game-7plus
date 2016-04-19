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
var cooldown = 2000;
var cd_modifier = 0.2;
// array for storing field values
var items = new Array(size);
// preinitialising it
for (var i = 0; i < size; i++) {
    items[i] = new Array(size);
}
// block generates op randomly
var ops = ["+", "-", "*", "/"];
// chances of appering op in block
var op_chances = [0.3, 0.3, 0.25, 0.15];
var op_lives = [3, 3, 1, 1];
var op_styles = {
    "+": "op_add",
    "-": "op_sub",
    "*": "op_mul",
    "/": "op_div"
};
// value, which you must reach for win
var finish = 100 + Math.floor(Math.random() * 800);
var lose_max = 999;
// number of player steps on field
var steps = 0;



// filling field randomly
for (var i = 0; i < size; i++)
    for (var j = 0; j < size; j++) {
        reborn_block(i, j);
    }

function reborn_block(i, j) {

    var lucky;
    var r = Math.random();
    for (lucky = 0; lucky < ops.length - 1; lucky++)
        if (r <= op_chances[lucky]) break;
        else r -= op_chances[lucky];
    var sign_index = lucky;
    var item = {
        'sign': ops[sign_index],
        'number': 1 + Math.floor(Math.random() * (size - 1)),
        'locked': false,
        'lives': op_lives[sign_index]
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

var intervalID;
var modified_cooldown = cooldown;

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
    } else return;


    if (!isOutOfBounds(oNext) && items[oNext.y][oNext.x].locked == false) {
        var oOld = Object.assign({}, o);
        o = oNext;
        o.value = step(o.value, items[o.y][o.x]);
        lock(o.value);
        var item = items[oOld.y][oOld.x];
        item.locked = true;
        item.lives--;
        if (item.lives == 0) reborn_block(oOld.y, oOld.x);
        steps++;
        update();
    }
    else  { if (o.value > finish) o.value+= 1 + Math.floor(Math.random() * 20);
            else if (o.value < finish) o.value-= + Math.floor(Math.random() * 20); update();}
    //else console.log("STOP");


    checkFinish()
}

function update()
{
        clearInterval(intervalID);
        if (!checkFinish())
                checkLose();
        document.getElementById("canvas").innerHTML = updateHTML();
        document.getElementById("steps").innerHTML = steps;

        modified_cooldown = cooldown * (1.0 - (500.0 - Math.min(Math.abs(o.value - finish), 500.0)) * (1.0 - cd_modifier) / 500.0);

        var bar = new ProgressBar.Path('#path', {
            easing: 'easeInOut',
            duration: modified_cooldown
        });
        bar.set(0);
        bar.animate(1.0);
        intervalID = setInterval(function() {
            if (o.value > finish) o.value++;
            else if (o.value < finish) o.value--;
            //clearInterval(intervalID);

            lock(o.value);
            modified_cooldown = cooldown * (1.0 - (500.0 - Math.min(Math.abs(o.value - finish), 500.0)) * (1.0 - cd_modifier) / 500.0);

            document.getElementById("canvas").innerHTML = updateHTML();

            bar = null;
            bar = new ProgressBar.Path('#path', {
                easing: 'easeInOut',
                duration: modified_cooldown
            });
            bar.set(0);
            bar.animate(1.0);
            //bar.animate(1.0);

            

        }, modified_cooldown);
}

function checkFinish() {
    if (finish == o.value) {
        document.getElementById("win").innerHTML = "<h1>YOU WIN!</h1><a href='index.html'><center>restart</center></a>";
        document.onkeydown = null;
        clearInterval(intervalID);
        return true;
    } else return false;
}

function checkLose() {
    if (lockedOrNotExists(o.y + 1, o.x) &&
        lockedOrNotExists(o.y - 1, o.x) &&
        lockedOrNotExists(o.y, o.x + 1) &&
        lockedOrNotExists(o.y, o.x - 1) ||
        o.value > lose_max || o.value < 1) {
        document.getElementById("win").innerHTML = "<h1>YOU LOSE!</h1><a href='index.html'><center>restart</center></a>";
        document.onkeydown = null;
        document.getElementById("canvas").className += " blur";
        clearInterval(intervalID);
        return true;
    } else return false;
}

function lockedOrNotExists(y, x) {
    if (isOutOfBounds({
        y, x
    }))
        return true;
    else
    /*if (items[y][x].locked)
        return true;*/
        return false;
}

function updateHTML() {
    var c = "<table>";
    for (var i = 0; i < size; i++) {
        c += "<tr>";
        for (var j = 0; j < size; j++) {
            c += "<td>";
            if (o.x == i && o.y == j) {
                c += "<div id='cooldown'>"; //class='block selected'>";
                c += "<svg style='z-index:1;'xmlns='http://www.w3.org/2000/svg' version='1.1' x='0px' y='0px' viewBox='0 0 40 40'><path id='path' fill-opacity='0' stroke-width='8' stroke='#FF9900' d='M20,0 40,0 40,40 0,40 0,0 20,0'/></svg>"
                c += "<div class='number'>" + o.value + "</div>";
            } else {
                var locked = items[j][i].locked ? "locked" : "";
                var lives = "lives" + items[j][i].lives;
                var opstyle = op_styles[items[j][i].sign];
                //switch ()
                c += "<div class='block " + locked + " " + lives + " " + opstyle + "'>";
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
    document.getElementById("seeddiv").innerHTML = "xotonic.github.io/?" + seed;
}