/*
 * LADD Roller Derby Track
 * Copyright © 2012  Neale Pickett <neale@woozle.org>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at
 * your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var canvas;
var ctx;
var scale;

var tau = Math.PI * 2;

// Measurements from Appendix B, 2010 rulebook
var ri = 12.5;
var ro = 26.5;
var halflen = 17.5;
var offset = 1.0;               // How far off-center the outer circle is
var curve_d = 7 + (0.5/12);     // Distance between lines in curves
var theta = Math.acos(1 - (curve_d * curve_d) / (2 * ri * ri));

var rp = 1;                     // Radius of a piece
var JAMMER = 0;
var PIVOT = 1;
var players = [];

function debug(msg) {
    var e = document.getElementById("debug");
    e.innerHTML = msg;
}

function player(color, pos) {
    var e = document.createElement("canvas");
    var ctx = e.getContext("2d");
    var body = document.getElementsByTagName("body")[0];
    var midpoint = rp + 0.5;

    e.moveTo = function(x, y) {
        var wx = ((x - midpoint) * scale) + window.innerWidth/2;
        var wy = (y - midpoint) * scale + window.innerHeight/2;

        e.pos = [x, y];
        e.style.left = wx + "px";
        e.style.top = wy + "px";

    }

    function mouseMove(evt) {
        var x = (evt.pageX - window.innerWidth/2) / scale;
        var y = (evt.pageY - window.innerHeight/2) / scale;

        e.moveTo(x, y);
    }

    function mouseUp() {
        var l = document.getElementById("link");
        var positions = [];

        for (var i = 0; i < players.length; i += 1) {
            positions.push(players[i].pos);
        }

        l.href = "#" + JSON.stringify(positions);

        window.onmousemove = null;
        window.onmouseup = null;
    }

    function mouseDown() {
        window.onmousemove = mouseMove;
        window.onmouseup = mouseUp;
    }
    e.onmousedown = mouseDown;

    players.push(e);
    body.appendChild(e);
    e.style.position = "absolute";
    e.moveTo(0, 0);

    // Draw it
    e.ctx = ctx;
    e.width = scale * (midpoint*2);
    e.height = scale * (midpoint*2);
    ctx.scale(scale, scale);
    ctx.translate(midpoint, midpoint);

    ctx.lineWidth = 2/12;
    ctx.strokeStyle = "#fff";
    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.arc(0, 0, rp, 0, tau);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (pos == PIVOT) {
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(0, 0, rp, tau*31/32, tau* 1/32);
        ctx.arc(0, 0, rp, tau*15/32, tau*17/32);
        ctx.closePath();
        ctx.fill();
    } else if (pos == JAMMER) {
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.rotate(tau/2);
        ctx.moveTo(0, rp);
        for (var i = 0; i < 5; i += 1) {
            ctx.rotate(tau/10);
            ctx.lineTo(0, rp * 0.4);
            ctx.rotate(tau/10);
            ctx.lineTo(0, rp);
        }
        ctx.fill();
        ctx.restore();
    } else {
        ctx.fillStyle = "#fff";
        ctx.font = midpoint + "px sans-serif";
        ctx.fillText(pos, -0.5, 0.5);
    }
    return e;
}

function drawTrack(ctx) {
    ctx.beginPath();
    ctx.arc( halflen, -offset, ro, tau*3/4, tau*1/4);
    ctx.arc(-halflen,  offset, ro, tau*1/4, tau*3/4);
    ctx.lineTo( halflen, -offset - ro);
    ctx.moveTo( halflen, -ri);
    ctx.lineTo(-halflen, -ri);
    ctx.arc(-halflen, 0, ri, tau*3/4, tau*1/4, true);
    ctx.arc( halflen, 0, ri, tau*1/4, tau*3/4, true);
    ctx.closePath();
}

function start() {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    var win_width = window.innerWidth;
    var win_height = window.innerHeight - 20;   // room for pentaly box
    scale = Math.min(win_width / 100, win_height / 60);

    canvas.width = scale * 100;
    canvas.height = scale * 60;

    // Set things up so all measurements are in feet.
    // This gives a 6-foot vertical border on each side,
    // and a 2.5-foot horizontal border on each side.
    ctx.scale(scale, scale);
    ctx.translate(50, 30);
    

    // Draw track according to WFTDA 2010 rulebook, Appendix B

    
    // Fill in track area
    ctx.fillStyle = "#888";
    drawTrack(ctx);
    ctx.fill();

    // A bunch of lines
    ctx.lineWidth = 1/12;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    for (var i = 0; i < 4; i += 1) {
        ctx.moveTo(halflen - i*10, ri);
        ctx.lineTo(halflen - i*10,  ro + offset);

        ctx.moveTo(i*10 - halflen, -ri);
        ctx.lineTo(i*10 - halflen, -ro - offset);
    }

    for (var j = 0; j < 2; j += 1) {
        ctx.save();
        ctx.translate(halflen * (j?-1:1), 0);
        ctx.rotate(j*tau/2);
        for (var i = 0; i < 5; i += 1) {
            ctx.rotate(-theta);
            ctx.moveTo(0, ri);
            ctx.lineTo(0, 12.5 + 15.0);
        }
        ctx.restore();
    }
    ctx.stroke();

    // Pivot and Jammer lines
    ctx.lineWidth =  4/12;
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(halflen     , ri);
    ctx.lineTo(halflen     , ro - offset);
    ctx.moveTo(halflen - 30, ri);
    ctx.lineTo(halflen - 30, ro + offset);
    ctx.stroke();

    // Now draw track boundaries
    ctx.lineWidth = 4/12;
    ctx.strokeStyle = "#ff0";
    ctx.fillStyle = "#000";
    drawTrack(ctx);
    ctx.stroke();


    var positions;

    try {
        positions = JSON.parse(location.hash.substr(1));
    }
    catch (e) {
        // Pass
    }

    for (var team = 0; team < 2; team += 1) {
        for (var pos = 0; pos < 5; pos += 1) {
            var p = player(team?"#080":"#f0f", pos);

            if (positions) {
                var coord = positions[team*5 + pos];
                p.moveTo(coord[0], coord[1]);
            } else if (pos == JAMMER) {
                p.moveTo(halflen - 30 - rp, ri + rp*(team*4 + 4));
            } else {
                p.moveTo(halflen-rp - team * (rp*3), ri + rp*(2.5*pos));
            }
        }
    }
}

window.onload = start;
