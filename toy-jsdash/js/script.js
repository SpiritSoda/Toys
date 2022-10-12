const canvas = document.getElementById('canvas');
const rules = document.getElementById('rules');
const ctx = canvas.getContext('2d');

const player_size = 18;
const ground_pos = canvas.height * 5 / 6;
const x_speed = 3;
const spike_size = 36;
const portal_width = 20;
const portal_height = 90;
const ring_radius = 14;
const bar_length = 500;
const bar_height = 20;

const start_pos_x = 0;
const start_pos_y = ground_pos - player_size;
const endline = 10800;

const default_style = "#000000";
const player_style = "#000000";
const spike_style = "#000000";
const wall_style = "#000000";
const platform_style = "#000000";

const loadline = canvas.width - 100;
const unloadline = 100;

function Spike(x, y, up){
    this.x_pos = x;
    this.y_pos = y;
    this.type = up;
    this.draw = function(x_pos,y_pos,scale){
        let size = spike_size * scale;
        ctx.fillStyle = spike_style;
        ctx.beginPath();
        if(this.type == 0){
            ctx.moveTo(x_pos - size / 2, y_pos);
            ctx.lineTo(x_pos, y_pos - 0.966 * size);
            ctx.lineTo(x_pos + size / 2, y_pos);
        }
        else if(this.type == 1){
            ctx.moveTo(x_pos - size / 2, y_pos);
            ctx.lineTo(x_pos, y_pos + 0.966 * size);
            ctx.lineTo(x_pos + size / 2, y_pos);
        }
        ctx.closePath();
        ctx.fill();
    }
}
function Portal(x, y, form){
    this.x_pos = x;
    this.y_pos = y;
    this.type = form;
    this.cooldown = 0;
    this.boost = 0.0
    this.draw = function(x_pos,y_pos,scale){
        let x_size = portal_width * scale;
        let y_size = portal_height * scale;
        let r = 255, g = 255, b = 255;
        if(this.type == 0){
            ctx.lineWidth = 2;
            ctx.strokeStyle = default_style
            ctx.beginPath();
            ctx.rect(x_pos - x_size / 2, y_pos - y_size / 2, x_size, y_size);
            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = default_style;
            ctx.beginPath();
            ctx.fillRect(x_pos - x_size / 4, y_pos - x_size / 4, x_size / 2, x_size / 2);
            ctx.closePath();
        }
        else if(this.type == 1){
            ctx.lineWidth = 2;
            ctx.strokeStyle = default_style
            ctx.beginPath();
            ctx.rect(x_pos - x_size / 2, y_pos - y_size / 2, x_size, y_size);
            ctx.stroke();
            ctx.fillStyle = default_style;
            ctx.beginPath();
            ctx.moveTo(x_pos - x_size / 4, y_pos + x_size / 4);
            ctx.lineTo(x_pos + x_size / 4, y_pos + x_size / 4);
            ctx.lineTo(x_pos, y_pos - x_size / 3);
            ctx.closePath();
            ctx.fill();
        }
        else if(this.type == 2){
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#42ADFF"
            r = 66;
            g = 173;
            ctx.beginPath();
            ctx.rect(x_pos - x_size / 2, y_pos - y_size / 2, x_size, y_size);
            ctx.closePath();
            ctx.stroke();
        }
        else if(this.type == 3){
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#FFFF00"
            b = 0;
            ctx.beginPath();
            ctx.rect(x_pos - x_size / 2, y_pos - y_size / 2, x_size, y_size);
            ctx.closePath();
            ctx.stroke();
        }
        else if(this.type == 4){
            ctx.lineWidth = 2;
            ctx.strokeStyle = default_style
            ctx.beginPath();
            ctx.rect(x_pos - x_size / 2, y_pos - y_size / 2, x_size, y_size);
            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = default_style;
            ctx.beginPath();
            ctx.arc(x_pos, y_pos, x_size / 4, 0, 2 * Math.PI, false);
            ctx.closePath();
            ctx.fill();
        }
        if(this.boost - 0.015 > 0){
            let arg = 200 / 255;
            ctx.strokeStyle = "rgba(" + r * arg + ", " + g * arg + ", " + b * arg + ", " + this.boost + ")";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.rect(x_pos - x_size / 2 * (2 - this.boost), y_pos - y_size / 2 * (2 - this.boost), x_size * (2 - this.boost), y_size * (2 - this.boost));
            ctx.closePath();
            ctx.stroke();
            this.boost -= 0.015;
        }
    }
    this.active = function(){
        if(this.cooldown > 0)
            return; 
        this.cooldown = 100;
        this.boost = 1.0;
        if(this.type == 0)
            player.type = 1; // cube form
        else if(this.type == 1)
            player.type = 2; // ship form
        else if(this.type == 2)
            player.reversed = 0; // positive gravity
        else if(this.type == 3)
            player.reversed = 1; // negative gravity
        else if(this.type == 4)
            player.type = 3; // ufo form
    }
}
function Platform(x, y, len){
    this.x_pos = x;
    this.y_pos = y;
    this.length = len;
    this.draw = function(x_pos,y_pos,scale){
        ctx.lineWidth = 2;
        ctx.strokeStyle = default_style;
        ctx.beginPath();
        ctx.moveTo(x_pos, y_pos + 1);
        ctx.lineTo(x_pos + this.length * scale, y_pos + 1);
        ctx.closePath();
        ctx.stroke();
    }
}
function Wall(x, y, len){
    this.x_pos = x;
    this.y_pos = y;
    this.length = len;
    this.draw = function(x_pos,y_pos,scale){
        ctx.lineWidth = 2;
        ctx.strokeStyle = default_style;
        ctx.beginPath();
        ctx.moveTo(x_pos, y_pos);
        ctx.lineTo(x_pos, y_pos + this.length * scale);
        ctx.closePath();
        ctx.stroke();
    }
}
function Ring(x, y, type){
    this.x_pos = x;
    this.y_pos = y;
    this.type = type;
    this.boost = 0.0;
    this.cooldown = 0;
    this.draw = function(x_pos,y_pos,scale){
        ctx.fillStyle = "#EDEDED";
        ctx.beginPath();
        ctx.arc(x_pos, y_pos, ring_radius * scale + 8, 0, 2*Math.PI, 0);
        ctx.closePath();
        ctx.fill();

        if(this.type == 0)
            ctx.fillStyle = "#FFFF00";
        else if(this.type == 1)
            ctx.fillStyle = "#42ADFF";
        ctx.beginPath();
        ctx.arc(x_pos, y_pos, ring_radius * scale, 0, 2*Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        
        if(this.type == 0)
            ctx.strokeStyle = "#FFFF00";
        else if(this.type == 1)
            ctx.strokeStyle = "#42ADFF";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x_pos, y_pos, ring_radius * scale + 6, 0, 2*Math.PI, 0);
        ctx.closePath();
        ctx.stroke();
        if(this.cooldown > 0)
            this.cooldown -= 1;

        if(this.boost - 0.015 > 0){
            ctx.strokeStyle = "rgba(160, 160, 160, " + this.boost + ")";
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.arc(x_pos, y_pos, (ring_radius + 20) * (1.0 - this.boost), 0, 2*Math.PI, 0);
            ctx.closePath();
            ctx.stroke();
            this.boost -= 0.015;
        }
    }
    this.active = function(){
        if(this.cooldown > 0)
            return; 
        bufferClick = false;
        this.cooldown = 100;
        this.boost = 1.0;
        if(this.type == 0)
            player.y_speed = -6;
        else if(this.type == 1){
            if(player.reversed === 0){
                player.reversed = 1;
                player.y_speed = -3.0;
            }
            else{
                player.reversed = 0;
                player.y_speed = 3.0;
            }
        }
    }
}
function Gear(x, y, size){
    this.x_pos = x;
    this.y_pos = y;
    this.size = size;
    this.rotate = 0;
    this.draw = function(x_pos,y_pos,scale){
        let angle = (this.rotate / 300) * 2 * Math.PI;
        this.rotate += 1;
        if(this.rotate >= 300)
            this.rotate -= 300;

        ctx.strokeStyle = default_style;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x_pos, y_pos, this.size * scale, 0, 2*Math.PI, 0);
        ctx.closePath();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(x_pos, y_pos, (this.size * 0.9) * scale, 0, 2*Math.PI, 0);
        ctx.closePath();
        ctx.stroke();

        ctx.lineWidth = 6;
        for(i = 0; i < 8; i++, angle += Math.PI / 4){
            ctx.beginPath();
            ctx.moveTo(x_pos - (this.size * 1.1 * Math.cos(angle)) * scale, y_pos - (this.size * 1.1 * Math.sin(angle)) * scale);
            ctx.lineTo(x_pos - (this.size * 0.9 * Math.cos(angle)) * scale, y_pos - (this.size * 0.9 * Math.sin(angle)) * scale);
            ctx.closePath();
            ctx.stroke();
        }
    }
}
function Endline(x, y){
    this.x_pos = x;
    this.y_pos = y;
    this.pulse = 0.0;
    this.anime = new Array();
    this.cooldown = 0;
    this.draw = function(x_pos,y_pos,scale){
        ctx.strokeStyle = default_style;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x_pos, 0);
        ctx.lineTo(x_pos, ground_pos);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = default_style;
        ctx.beginPath();
        ctx.arc(x_pos, ground_pos / 2, 10, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = "rgba(100, 100, 100, " + (1 - this.pulse) + ")";
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.arc(x_pos, ground_pos / 2, (ring_radius + 20) * this.pulse, 0, 2*Math.PI, 0);
        ctx.closePath();
        ctx.stroke();
        this.pulse += 0.018;
        if(this.pulse > 1.0)
            this.pulse = 0.0;
        for(let i = 0; i < this.anime.length; i ++){
            let a = this.anime[i];
            if(a > 0.1){
                if(a > 1.0){
                    this.anime[i] -= 0.018;
                    continue;
                }
                ctx.strokeStyle = "rgba(20, 20, 20, " + a + ")";
                ctx.beginPath();
                ctx.lineWidth = 3;
                ctx.arc(x_pos, ground_pos / 2, ground_pos * (1 - a), 0, 2*Math.PI, 0);
                ctx.closePath();
                ctx.stroke();
                this.anime[i] -= 0.018;
            }
            else
                this.anime.splice(i, 1); 
        }
    }
    this.active = function(){
        if(this.cooldown > 0)
            return;
        this.cooldown = 1;
        this.anime.push(1.0);
        this.anime.push(1.25);
        this.anime.push(1.5);
        gameEnd(0);
    }
}

function objectQueue(){
    this.objects = new Array();
    this.begin = 0;
    this.load_end = 0;
    this.end = 0;
    this.push = function(object){
        this.objects[this.end] = object;
        this.end ++;
    }
    this.size = function(){
        return this.end - this.begin;
    }
    this.pop = function(){
        let front = this.objects[this.begin];
        this.begin ++;
        return front;
    }
    this.front = function(){
        return this.objects[this.begin];
    }
    this.hasLoad = function(){
        return this.end > this.begin;
    }
    this.sort = function(){
        this.objects.sort((o1, o2) => {return o1.x_pos - o2.x_pos});
    }
    this.reset = function(){
        this.objects.forEach(o => {if("cooldown" in o) o.cooldown = 0; if("boost" in o) o.boost = 0.0;})
    }
}

function gameEnd(status){
    if(status != 0){
        player.x_pos = start_pos_x;
        player.y_pos = start_pos_y;
        setTimeout(reset, 1000)
        game_end = 1;
    }
    else{
        player.x_pos = start_pos_x;
        player.y_pos = start_pos_y;
        setTimeout(reset, 5000);
        game_end = 2;
    }
}
function levelFinish(){
    ctx.font = '20px Arial';
    ctx.fillText(`GG! You complete the level. Thanks for playing.`, canvas.width / 2 - 200, 100);
}

var levelObject = new objectQueue();
var dist = start_pos_x;
var groundline = ground_pos;
var game_end = 0;
var game_pause = true;

var player = {
    type: 1,
    x_pos: canvas.width / 2,
    y_pos: start_pos_y,
    y_speed: 0,
    y_force: 0,
    inAir: 0,
    reversed: 0,
    getGravArg: function(){
        if(this.reversed === 0)
            return 1.0;
        else
            return -1.0;
    },
    getGravity: function(){
        let arg = this.getGravArg();
        if(this.type === 1)
            return 0.2 * arg;
        else if(this.type === 2)
            return 0.08 * arg;
        else if(this.type === 3)
            return 0.10 * arg;
    },
    collideWithSpike: function(spike){
        let spike_pos_x = spike.x_pos - dist;
        let spike_pos_y = spike.y_pos;
        let length = 0.0;
        if(spike.type == 0)
            length = Math.sqrt(Math.pow(spike_pos_x - player.x_pos, 2) + Math.pow(spike_pos_y - spike_size / (2 * 1.732) - player.y_pos, 2));
        else
            length = Math.sqrt(Math.pow(spike_pos_x - player.x_pos, 2) + Math.pow(spike_pos_y + spike_size / (2 * 1.732) - player.y_pos, 2));
        if(length < player_size + spike_size * 0.4)
            return true;
        else 
            return false;
    },
    collideWithPortal: function(portal){
        let portal_pos_x = portal.x_pos - dist;
        let portal_pos_y = portal.y_pos;
        if(Math.abs(portal_pos_x - player.x_pos) < (portal_width / 2 + player_size) && Math.abs(portal_pos_y - player.y_pos) < (portal_height / 2 + player_size))
            return true;
        else
            return false;
    },
    collideWithPlatform: function(platform){
        let platform_pos_x = platform.x_pos - dist;
        let platform_pos_y = platform.y_pos;
        if(player.reversed === 0){
            if(player.x_pos > platform_pos_x && player.x_pos < platform_pos_x + platform.length && player.y_pos > platform_pos_y && player.y_pos - player_size < platform_pos_y)
                return true;
            else
                return false;
        }
        else{
            if(player.x_pos > platform_pos_x && player.x_pos < platform_pos_x + platform.length && player.y_pos < platform_pos_y && player.y_pos + player_size > platform_pos_y)
                return true;
            else
                return false;
        }
    },
    collideWithWall: function(wall){
        let wall_pos_x = wall.x_pos - dist;
        let wall_pos_y = wall.y_pos;
        if(player.x_pos < wall_pos_x && player.x_pos + player_size > wall_pos_x && player.y_pos > wall_pos_y && player.y_pos < wall_pos_y + wall.length)
            return true;
        else
            return false;
    },
    collideWithRing: function(ring){
        let ring_pos_x = ring.x_pos - dist;
        let ring_pos_y = ring.y_pos;
        let length = Math.sqrt(Math.pow(ring_pos_x - player.x_pos, 2) + Math.pow(ring_pos_y - player.y_pos, 2));
        if(length < player_size + ring_radius + 6)
            return true;
        else 
            return false;
    },
    collideWithGear: function(gear){
        let gear_pos_x = gear.x_pos - dist;
        let gear_pos_y = gear.y_pos;
        let length = Math.sqrt(Math.pow(gear_pos_x - player.x_pos, 2) + Math.pow(gear_pos_y - player.y_pos, 2));
        if(length < player_size + gear.size)
            return true;
        else 
            return false;
    },
    collideWithEndline: function(endline){
        let endline_pos_x = endline.x_pos - dist;
        let endline_pos_y = endline.y_pos;
        if(endline_pos_x > player.x_pos - player_size && endline_pos_x < player.x_pos + player_size)
            return true;
        else 
            return false;
    }
};

function onGround(){
    if(player.reversed === 0){
        if(player.y_pos + player_size >= groundline)
            return true;
        else
            return false;
    }
    else{
        if(player.y_pos - player_size <= groundline)
            return true;
        else
            return false;
    }
}

function drawGround(){
    ctx.strokeStyle = default_style;
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.moveTo(0, ground_pos + 1);
    ctx.lineTo(canvas.width, ground_pos + 1);
    ctx.closePath();
    ctx.stroke();
}

function drawPlayer_1(){
    ctx.beginPath();
    ctx.fillStyle = player_style;
    let edge = Math.sqrt(2) * player_size;
    let angle = (player.inAir / 64) * Math.PI / 2;
    if(player.reversed === 0){
        if(angle <= Math.PI / 4){
            let theta = Math.PI / 4 - angle;
            ctx.moveTo(player.x_pos - edge * Math.cos(theta), player.y_pos + edge * Math.sin(theta));
            ctx.lineTo(player.x_pos - edge * Math.sin(theta), player.y_pos - edge * Math.cos(theta));
            ctx.lineTo(player.x_pos + edge * Math.cos(theta), player.y_pos - edge * Math.sin(theta));
            ctx.lineTo(player.x_pos + edge * Math.sin(theta), player.y_pos + edge * Math.cos(theta));
        }
        else{
            let theta = angle - Math.PI / 4;
            ctx.moveTo(player.x_pos - edge * Math.cos(theta), player.y_pos - edge * Math.sin(theta));
            ctx.lineTo(player.x_pos + edge * Math.sin(theta), player.y_pos - edge * Math.cos(theta));
            ctx.lineTo(player.x_pos + edge * Math.cos(theta), player.y_pos + edge * Math.sin(theta));
            ctx.lineTo(player.x_pos - edge * Math.sin(theta), player.y_pos + edge * Math.cos(theta));
        }
    }
    else{
        if(angle <= Math.PI / 4){
            let theta = Math.PI / 4 - angle;
            ctx.moveTo(player.x_pos - edge * Math.sin(theta), player.y_pos + edge * Math.cos(theta));
            ctx.lineTo(player.x_pos - edge * Math.cos(theta), player.y_pos - edge * Math.sin(theta));
            ctx.lineTo(player.x_pos + edge * Math.sin(theta), player.y_pos - edge * Math.cos(theta));
            ctx.lineTo(player.x_pos + edge * Math.cos(theta), player.y_pos + edge * Math.sin(theta));
        }
        else{
            let theta = angle - Math.PI / 4;
            ctx.moveTo(player.x_pos - edge * Math.sin(theta), player.y_pos - edge * Math.cos(theta));
            ctx.lineTo(player.x_pos + edge * Math.cos(theta), player.y_pos - edge * Math.sin(theta));
            ctx.lineTo(player.x_pos + edge * Math.sin(theta), player.y_pos + edge * Math.cos(theta));
            ctx.lineTo(player.x_pos - edge * Math.cos(theta), player.y_pos + edge * Math.sin(theta));
        }
    }
    ctx.closePath();
    ctx.fill();
}
function drawPlayer_2(){
    ctx.beginPath();
    ctx.fillStyle = player_style;
    let y_speed = player.y_speed;
    let line = Math.sqrt(x_speed * x_speed + y_speed * y_speed);
    let sin = x_speed / line;
    let cos = - y_speed / line;
    let size1 = player_size, size2 = player_size * 0.9, size3 = player_size * 1.2;

    ctx.moveTo(player.x_pos - size1 * sin - size2 * cos , player.y_pos + size1 * cos - size2 * sin);
    ctx.lineTo(player.x_pos + size3 * sin , player.y_pos - size3 * cos);
    ctx.lineTo(player.x_pos - size1 * sin + size2 * cos , player.y_pos + size1 * cos + size2 * sin);
    ctx.closePath();
    ctx.fill();
}
function drawPlayer_3(){
    ctx.fillStyle = player_style;
    if(player.reversed == 0){
        ctx.beginPath();
        ctx.moveTo(player.x_pos - player_size * 0.8, player.y_pos + player_size * 0.1);
        ctx.lineTo(player.x_pos - player_size * 1.0, player.y_pos + player_size * 0.7);
        ctx.lineTo(player.x_pos + player_size * 1.0, player.y_pos + player_size * 0.7);
        ctx.lineTo(player.x_pos + player_size * 0.8, player.y_pos + player_size * 0.1);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(player.x_pos, player.y_pos - player_size * 0.2, player_size* 0.7, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(player.x_pos, player.y_pos + player_size * 0.7, player_size* 0.3, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
    }
    else{
        ctx.beginPath();
        ctx.moveTo(player.x_pos - player_size * 0.8, player.y_pos - player_size * 0.1);
        ctx.lineTo(player.x_pos - player_size * 1.0, player.y_pos - player_size * 0.7);
        ctx.lineTo(player.x_pos + player_size * 1.0, player.y_pos - player_size * 0.7);
        ctx.lineTo(player.x_pos + player_size * 0.8, player.y_pos - player_size * 0.1);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(player.x_pos, player.y_pos + player_size * 0.2, player_size* 0.7, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(player.x_pos, player.y_pos - player_size * 0.7, player_size* 0.3, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();
    }
}

function drawPlayer(){
    if(player.type == 1)
        drawPlayer_1();
    else if(player.type == 2)
        drawPlayer_2();
    else if(player.type == 3)
        drawPlayer_3();
}
function drawObject(){
    let left_edge = dist, right_edge = dist + canvas.width;
    let unload = dist + unloadline, load = dist + loadline;
    while(levelObject.hasLoad() && levelObject.front().x_pos < left_edge){
        levelObject.pop();
    }
    while(levelObject.load_end < levelObject.objects.length && levelObject.objects[levelObject.load_end].x_pos <= right_edge){
        levelObject.load_end ++;
    }
    for(var i = levelObject.begin; i < levelObject.load_end; i ++){
        let object = levelObject.objects[i];
        let x_pos = object.x_pos - left_edge;
        let y_pos = object.y_pos;
        let scale = 1.0;
        if(object.x_pos < unload)
            scale = (object.x_pos - left_edge) / (unload - left_edge);
        else if(object.x_pos > load)
            scale = (right_edge - object.x_pos) / (right_edge - load);
        object.draw(x_pos, y_pos, scale);
        if(object instanceof Spike && player.collideWithSpike(object)){
            gameEnd(1);
        }
        else if(object instanceof Portal && player.collideWithPortal(object)){
            object.active();
        }
        else if(object instanceof Platform && player.collideWithPlatform(object)){
            gameEnd(1);
        }
        else if(object instanceof Wall && player.collideWithWall(object)){
            gameEnd(1);
        }
        else if(object instanceof Ring && player.collideWithRing(object) && bufferClick && object.cooldown === 0){
            object.active();
        }
        else if(object instanceof Gear && player.collideWithGear(object)){
            gameEnd(1);
        }
        else if(object instanceof Endline && player.collideWithEndline(object)){
            object.active();
        }
    }
}
function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillText(`Object Count: ${levelObject.load_end - levelObject.begin}`, canvas.width - 160, 30);
    ctx.fillText(`Distance: ${dist}`, canvas.width - 160, 60);
    ctx.fillText(`Player Form: ${player.type}`, canvas.width - 160, 90);
}
function drawBar() {
    ctx.strokeStyle = default_style;
    ctx.fillStyle = default_style;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.rect(canvas.width / 2 - bar_length / 2, 25 - bar_height / 2, bar_length, bar_height);
    ctx.closePath();
    ctx.stroke();

    let progress = dist / (endline - canvas.width / 2);
    ctx.beginPath();
    ctx.rect(canvas.width / 2 - bar_length / 2, 25 - bar_height / 2, bar_length * progress, bar_height);
    ctx.closePath();
    ctx.fill();
}
function drawPause(){
    let pause_icon = 30;

    ctx.fillStyle = "rgb(240, 240, 240)";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, pause_icon * 2.5, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "rgb(100, 100, 100)";
    ctx.strokeStyle = "rgb(0, 0, 0)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 + pause_icon * 1.73, canvas.height / 2);
    ctx.lineTo(canvas.width / 2 - pause_icon, canvas.height / 2 + pause_icon * 1.73);
    ctx.lineTo(canvas.width / 2 - pause_icon, canvas.height / 2 - pause_icon * 1.73);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 + pause_icon * 1.73, canvas.height / 2);
    ctx.lineTo(canvas.width / 2 - pause_icon, canvas.height / 2 + pause_icon * 1.73);
    ctx.lineTo(canvas.width / 2 - pause_icon, canvas.height / 2 - pause_icon * 1.73);
    ctx.closePath();
    ctx.stroke();
    
    ctx.strokeStyle = "rgb(0, 0, 0)";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, pause_icon * 2.5, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.stroke();
}


function init(){
    levelObject.push(new Gear(1080, ground_pos - 300, 60));
    levelObject.push(new Gear(700, ground_pos - 150, 50));

    levelObject.push(new Spike(850, ground_pos - 160, 1));
    levelObject.push(new Wall(832, 0, 340));
    levelObject.push(new Wall(868, 0, 340));
    levelObject.push(new Spike(900, ground_pos, 0));
    levelObject.push(new Spike(940, ground_pos, 0));
    levelObject.push(new Spike(980, ground_pos, 0));
    
    levelObject.push(new Platform(1200, ground_pos - 80, 100));
    levelObject.push(new Wall(1200, ground_pos - 80, 80));
    levelObject.push(new Spike(1280, ground_pos - 80, 0));
    levelObject.push(new Wall(1300, ground_pos - 80, 80));

    levelObject.push(new Spike(1500, ground_pos, 0));
    levelObject.push(new Spike(1540, ground_pos, 0));
    levelObject.push(new Spike(1580, ground_pos, 0));
    
    levelObject.push(new Wall(1782, 0, 300));
    levelObject.push(new Spike(1800, ground_pos - 200, 1));
    levelObject.push(new Wall(1818, 0, 300));
    levelObject.push(new Spike(1800, ground_pos, 0));
    levelObject.push(new Portal(1800, ground_pos - 100, 1));

    levelObject.push(new Gear(2100, 200, 75))
    levelObject.push(new Gear(2200, 420, 60))
    
    levelObject.push(new Wall(2400, ground_pos - 120, 120));
    levelObject.push(new Wall(2400, 0, 200));
    levelObject.push(new Spike(2400, ground_pos - 120, 0));
    levelObject.push(new Spike(2440, ground_pos - 120, 0));
    levelObject.push(new Spike(2480, ground_pos - 120, 0));
    levelObject.push(new Spike(2400, ground_pos - 300, 1));
    levelObject.push(new Spike(2440, ground_pos - 300, 1));
    levelObject.push(new Spike(2480, ground_pos - 300, 1));
    levelObject.push(new Wall(2480, ground_pos - 120, 120));
    levelObject.push(new Wall(2480, 0, 200));
    
    levelObject.push(new Gear(2650, 150, 50))
    levelObject.push(new Gear(2650, 400, 50))
    
    levelObject.push(new Wall(2800, ground_pos - 60, 60));
    levelObject.push(new Wall(2800, 0, 260));
    levelObject.push(new Spike(2800, ground_pos - 60, 0));
    levelObject.push(new Spike(2840, ground_pos - 60, 0));
    levelObject.push(new Spike(2880, ground_pos - 60, 0));
    levelObject.push(new Spike(2800, ground_pos - 240, 1));
    levelObject.push(new Spike(2840, ground_pos - 240, 1));
    levelObject.push(new Spike(2880, ground_pos - 240, 1));
    levelObject.push(new Wall(2880, ground_pos - 60, 60));
    levelObject.push(new Wall(2880, 0, 260));
    
    levelObject.push(new Gear(3050, 160, 50))
    levelObject.push(new Gear(3050, 380, 50))
       
    levelObject.push(new Wall(3200, ground_pos - 200, 200));
    levelObject.push(new Wall(3200, 0, 120));
    levelObject.push(new Spike(3200, ground_pos - 200, 0));
    levelObject.push(new Spike(3240, ground_pos - 200, 0));
    levelObject.push(new Spike(3280, ground_pos - 200, 0));
    levelObject.push(new Spike(3200, ground_pos - 380, 1));
    levelObject.push(new Spike(3240, ground_pos - 380, 1));
    levelObject.push(new Spike(3280, ground_pos - 380, 1));
    levelObject.push(new Wall(3280, ground_pos - 200, 200));
    levelObject.push(new Wall(3280, 0, 120));
    
    levelObject.push(new Wall(3582, 0, 250));
    levelObject.push(new Wall(3532, ground_pos - 50, 50));
    levelObject.push(new Spike(3600, ground_pos - 250, 1));
    levelObject.push(new Spike(3550, ground_pos - 50, 0));
    levelObject.push(new Portal(3580, ground_pos - 150, 0));
    levelObject.push(new Wall(3618, 0, 250));
    levelObject.push(new Wall(3568, ground_pos - 50, 50));
    
    levelObject.push(new Platform(3568, ground_pos - 30, 248));
    levelObject.push(new Spike(3798, ground_pos - 30, 0));
    levelObject.push(new Wall(3816, ground_pos - 30, 30));

    levelObject.push(new Spike(3836, ground_pos, 0));
    levelObject.push(new Spike(3876, ground_pos, 0));
    levelObject.push(new Spike(3916, ground_pos, 0));
    levelObject.push(new Ring(3920, ground_pos - 80, 0));
    levelObject.push(new Spike(3956, ground_pos, 0));
    levelObject.push(new Spike(3996, ground_pos, 0));
    
    levelObject.push(new Wall(4002, 0, 230));
    levelObject.push(new Spike(4020, ground_pos - 270, 1));
    levelObject.push(new Spike(4036, ground_pos, 0));
    levelObject.push(new Wall(4038, 0, 230));
    levelObject.push(new Ring(4030, ground_pos - 160, 0));
    levelObject.push(new Spike(4076, ground_pos, 0));
    levelObject.push(new Spike(4116, ground_pos, 0));

    
    levelObject.push(new Platform(4160, ground_pos - 150, 140));
    levelObject.push(new Wall(4160, ground_pos - 150, 150));
    levelObject.push(new Platform(4300, ground_pos - 150, 100));
    levelObject.push(new Spike(4360, ground_pos - 150, 0));
    levelObject.push(new Spike(4400, ground_pos - 150, 0));
    levelObject.push(new Platform(4400, ground_pos - 150, 100));
    levelObject.push(new Spike(4440, ground_pos - 150, 0));
    levelObject.push(new Platform(4500, ground_pos - 150, 100));
    levelObject.push(new Spike(4580, ground_pos - 150, 0));
    levelObject.push(new Wall(4600, ground_pos - 150, 150));

    
    levelObject.push(new Wall(4700, 0, 200));
    levelObject.push(new Platform(4700, 200, 100));
    levelObject.push(new Ring(4700, ground_pos - 140, 1));
    levelObject.push(new Platform(4800, 200, 100));
    levelObject.push(new Wall(4900, 0, 200));
    
    levelObject.push(new Spike(4620, ground_pos, 0));
    levelObject.push(new Spike(4660, ground_pos, 0));
    levelObject.push(new Spike(4700, ground_pos, 0));
    levelObject.push(new Spike(4740, ground_pos, 0));
    levelObject.push(new Spike(4780, ground_pos, 0));
    levelObject.push(new Spike(4820, ground_pos, 0));

    
    levelObject.push(new Platform(5000, 250, 100));
    levelObject.push(new Platform(5100, 250, 100));
    levelObject.push(new Platform(5200, 250, 100));
    levelObject.push(new Platform(5300, 250, 100));
    levelObject.push(new Wall(5000, 0, 250));
    levelObject.push(new Wall(5400, 0, 250));
    levelObject.push(new Spike(5160, 250, 1));
    levelObject.push(new Spike(5200, 250, 1));
    levelObject.push(new Spike(5240, 250, 1));
    levelObject.push(new Spike(5382, 250, 1));

    levelObject.push(new Ring(5500, 280, 1));
    levelObject.push(new Ring(5560, 420, 1));
    levelObject.push(new Ring(5620, 280, 1));
    
    levelObject.push(new Platform(5500, 150, 100));
    levelObject.push(new Platform(5600, 150, 100));
    levelObject.push(new Wall(5500, 0, 150));
    levelObject.push(new Wall(5700, 0, 150));
    levelObject.push(new Spike(5520, 150, 1));
    levelObject.push(new Spike(5560, 150, 1));
    levelObject.push(new Spike(5600, 150, 1));
    levelObject.push(new Spike(5640, 150, 1));
    levelObject.push(new Spike(5680, 150, 1));

    levelObject.push(new Spike(5480, ground_pos, 0));
    levelObject.push(new Spike(5520, ground_pos, 0));
    levelObject.push(new Spike(5560, ground_pos, 0));
    levelObject.push(new Spike(5600, ground_pos, 0));
    
    levelObject.push(new Wall(5820, 0, 400));
    levelObject.push(new Platform(5820, ground_pos - 100, 120));
    levelObject.push(new Wall(5940, 0, 400));
    levelObject.push(new Spike(5840, ground_pos - 100, 1));
    levelObject.push(new Spike(5880, ground_pos - 100, 1));
    levelObject.push(new Spike(5920, ground_pos - 100, 1));
    
    levelObject.push(new Portal(6000, ground_pos - portal_height / 2 - 10, 3));
    levelObject.push(new Portal(6080, ground_pos - portal_height / 2 - 60, 2));
    levelObject.push(new Portal(6160, ground_pos - portal_height / 2 - 110, 3));
    levelObject.push(new Portal(6200, ground_pos - portal_height / 2 - 150, 2));
    levelObject.push(new Portal(6300, ground_pos - portal_height / 2 - 100, 3));

    levelObject.push(new Portal(6380, ground_pos - portal_height / 2 - 120, 1));
    
    levelObject.push(new Portal(6600, 250, 2));
    levelObject.push(new Gear(6600, 400, 75));
    levelObject.push(new Gear(6600, 100, 75));
    
    levelObject.push(new Spike(6680, ground_pos, 0));
    levelObject.push(new Spike(6720, ground_pos, 0));
    levelObject.push(new Spike(6760, ground_pos, 0));
    levelObject.push(new Spike(6800, ground_pos, 0));
    levelObject.push(new Spike(6840, ground_pos, 0));
    levelObject.push(new Spike(6880, ground_pos, 0));
    levelObject.push(new Spike(6920, ground_pos, 0));
    
    levelObject.push(new Spike(6680, 0, 1));
    levelObject.push(new Spike(6720, 0, 1));
    levelObject.push(new Spike(6760, 0, 1));
    levelObject.push(new Spike(6800, 0, 1));
    levelObject.push(new Spike(6840, 0, 1));
    levelObject.push(new Spike(6880, 0, 1));
    levelObject.push(new Spike(6920, 0, 1));

    levelObject.push(new Portal(7000, 270, 3));
    levelObject.push(new Gear(7000, 120, 75));
    levelObject.push(new Gear(7000, 420, 75));
    
    levelObject.push(new Gear(7250, 360, 75));
    
    levelObject.push(new Spike(7080, 0, 1));
    levelObject.push(new Spike(7120, 0, 1));
    levelObject.push(new Spike(7160, 0, 1));
    levelObject.push(new Spike(7200, 0, 1));
    levelObject.push(new Spike(7240, 0, 1));
    levelObject.push(new Spike(7280, 0, 1));
    levelObject.push(new Spike(7320, 0, 1));
    levelObject.push(new Spike(7360, 0, 1));
    levelObject.push(new Spike(7400, 0, 1));

    levelObject.push(new Wall(7442, 0, 200));
    levelObject.push(new Spike(7460, 200, 1));
    levelObject.push(new Wall(7478, 0, 200));
    levelObject.push(new Wall(7442, 400, 100));
    levelObject.push(new Spike(7460, 400, 0));
    levelObject.push(new Wall(7478, 400, 100));

    levelObject.push(new Portal(7500, 300, 0));
    levelObject.push(new Portal(7520, 300, 2));

    levelObject.push(new Spike(7800, ground_pos, 0));
    levelObject.push(new Spike(7840, ground_pos, 0));
    levelObject.push(new Spike(7880, ground_pos, 0));
    
    levelObject.push(new Portal(7840, ground_pos - 100, 4));

    levelObject.push(new Wall(7982, 0, 280));
    levelObject.push(new Wall(7982, ground_pos - 60, 60));
    levelObject.push(new Spike(8000, ground_pos - 220, 1));
    levelObject.push(new Spike(8000, ground_pos - 60, 0));
    levelObject.push(new Wall(8018, 0, 280));
    levelObject.push(new Wall(8018, ground_pos - 60, 60));

    levelObject.push(new Wall(8082, 0, 220));
    levelObject.push(new Wall(8082, ground_pos - 120, 120));
    levelObject.push(new Spike(8100, ground_pos - 280, 1));
    levelObject.push(new Spike(8100, ground_pos - 120, 0));
    levelObject.push(new Wall(8118, 0, 220));
    levelObject.push(new Wall(8118, ground_pos - 120, 120));

    levelObject.push(new Wall(8182, 0, 160));
    levelObject.push(new Wall(8182, ground_pos - 180, 180));
    levelObject.push(new Spike(8200, ground_pos - 340, 1));
    levelObject.push(new Spike(8200, ground_pos - 180, 0));
    levelObject.push(new Wall(8218, 0, 160));
    levelObject.push(new Wall(8218, ground_pos - 180, 180));
    
    levelObject.push(new Portal(8260, ground_pos - 240, 3));
    
    levelObject.push(new Wall(8250, 0, 180));
    levelObject.push(new Platform(8250, ground_pos - 320, 200));
    levelObject.push(new Wall(8450, 0, 180));
    
    levelObject.push(new Wall(8482, 0, 160));
    levelObject.push(new Wall(8482, ground_pos - 180, 180));
    levelObject.push(new Spike(8500, ground_pos - 340, 1));
    levelObject.push(new Spike(8500, ground_pos - 180, 0));
    levelObject.push(new Wall(8518, 0, 160));
    levelObject.push(new Wall(8518, ground_pos - 180, 180));

    levelObject.push(new Wall(8582, 0, 220));
    levelObject.push(new Wall(8582, ground_pos - 120, 120));
    levelObject.push(new Spike(8600, ground_pos - 280, 1));
    levelObject.push(new Spike(8600, ground_pos - 120, 0));
    levelObject.push(new Wall(8618, 0, 220));
    levelObject.push(new Wall(8618, ground_pos - 120, 120));
    
    levelObject.push(new Wall(8682, 0, 280));
    levelObject.push(new Wall(8682, ground_pos - 60, 60));
    levelObject.push(new Spike(8700, ground_pos - 220, 1));
    levelObject.push(new Spike(8700, ground_pos - 60, 0));
    levelObject.push(new Wall(8718, 0, 280));
    levelObject.push(new Wall(8718, ground_pos - 60, 60));
    
    levelObject.push(new Portal(8780, ground_pos - 120, 2));
    levelObject.push(new Ring(8780, ground_pos - 120, 0));
    
    levelObject.push(new Gear(8950, ground_pos - 130, 100));
    levelObject.push(new Gear(8950, ground_pos - 420, 100));

    levelObject.push(new Ring(9130, ground_pos - 150, 1));
    levelObject.push(new Ring(9130, ground_pos - 120, 1));
    levelObject.push(new Wall(9132, 0, 250));
    levelObject.push(new Spike(9150, ground_pos - 250, 1));
    levelObject.push(new Wall(9168, 0, 250));
    
    levelObject.push(new Wall(9202, ground_pos - 100, 100));
    levelObject.push(new Spike(9220, ground_pos - 100, 0));
    levelObject.push(new Wall(9238, ground_pos - 100, 100));
    
    levelObject.push(new Portal(9220, ground_pos - 200, 2));
    levelObject.push(new Portal(9230, ground_pos - 220, 0));

    
    levelObject.push(new Spike(9600, ground_pos, 0));
    levelObject.push(new Spike(9640, ground_pos, 0));
    levelObject.push(new Spike(9680, ground_pos, 0));
    
    levelObject.push(new Spike(9900, ground_pos, 0));
    levelObject.push(new Spike(9940, ground_pos, 0));
    levelObject.push(new Spike(9980, ground_pos, 0));
    
    levelObject.push(new Spike(10200, ground_pos, 0));
    levelObject.push(new Spike(10240, ground_pos, 0));
    levelObject.push(new Spike(10280, ground_pos, 0));
    
    levelObject.push(new Endline(endline, ground_pos));

    levelObject.sort();
    
}

function reset(){
    dist = start_pos_x;
    levelObject.begin = 0;
    levelObject.load_end = 0;
    player.type = 1;
    player.x_pos = canvas.width / 2;
    player.y_pos = start_pos_y;
    player.y_speed = 0;
    player.y_force = 0;
    player.inAir = 0;
    player.reversed = 0;
    levelObject.reset();
    game_end = 0;
}

function draw() {
    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGround();
    drawObject();
    if(!game_end)
        drawPlayer();
    if(game_end == 2)
        levelFinish();
    drawBar();
    if(game_pause)
        drawPause();
}

function movePlayer(){
    if(game_pause || game_end)
        return;
    dist += x_speed;
    if(onGround()){
        if(player.reversed === 0)
            player.y_pos = groundline - player_size;
        else
            player.y_pos = groundline + player_size;
        player.y_speed = 0;
        player.inAir = 0;
    }
    else{
        player.inAir += 1;
        if(player.inAir > 64)
            player.inAir = 0;
        var gravity = player.getGravity();
        player.y_speed += (gravity + player.y_force);
        if(Math.abs(player.y_speed) > 10)
            player.y_speed = 10.0 * player.getGravArg();
        player.y_pos += player.y_speed;
        player.y_force = 0;
    }
    if(player.reversed == 0 && player.y_pos < 0)
        gameEnd(1);
    else if(player.reversed == 1 && player.y_pos > ground_pos)
        gameEnd(1);
}

var mouseDown = false;
var mouseClick = false;
var bufferClick = false;
function processClick(){
    if(game_pause || game_end)
        return;
    let arg = player.getGravArg();
    if(mouseDown){
        if(player.type == 1 && onGround()){
            bufferClick = false;
            player.y_speed = -6.4 * arg;
            player.y_pos -= 1 * arg;
        }
        else if(player.type == 2){
            player.y_force = -0.16 * arg;
            player.y_pos -= 1 * arg;
        }
    }
    if(mouseClick){
        if(player.type == 3){
            player.y_speed = -3.6 * arg;
            player.y_pos -= 1 * arg;
        }
    }
}

function getGround(){
    let ground = ground_pos;
    if(player.reversed === 1)
        ground = 0;
    for(var i = levelObject.begin; i < levelObject.load_end; i ++){
        let object = levelObject.objects[i];
        let x_pos = object.x_pos - dist;
        if(object instanceof Platform){
            if(player.reversed === 0){
                if(object.y_pos >= player.y_pos && x_pos < player.x_pos && x_pos + object.length > player.x_pos){
                    ground = Math.min(object.y_pos, ground);
                } 
            }
            else{
                if(object.y_pos <= player.y_pos && x_pos < player.x_pos && x_pos + object.length > player.x_pos){
                    ground = Math.max(object.y_pos, ground);
                } 
            }
        }
    }
    return ground;
}

function update(){
    groundline = getGround();
    processClick();
    movePlayer();

    draw();
    if(mouseClick){
        if(game_pause){
            game_pause = false;
            mouseDown = false;
        }
        else{
            if(player.type == 1)
                setTimeout(() => {bufferClick = false;}, 100);
            else
                bufferClick = false;
        }
        mouseClick= false;
    }
    requestAnimationFrame(update);
}

init();
update();
canvas.onmousedown = function(e){
    if(e.button == 0){
        mouseClick = true;
        bufferClick = true;
        mouseDown = true;
    }
}
canvas.onmouseup = function(e){
    if(e.button == 0){
        mouseDown = false;
    }
}
document.onkeydown = function(e){
    if(window.event.keyCode==27){
        if(!game_end){
            if(!game_pause)
                game_pause = true;
            else
                game_pause = false;
        }
    }
}
rules.onclick = function(){
    window.open("https://github.com/SpiritSoda/JSDash/blob/main/README.md");
}