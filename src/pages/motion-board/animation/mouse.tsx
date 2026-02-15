/**
 * MIT License
 * 
 * Copyright (c) 2026 game1024
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import mojs from '@mojs/core';
import type { MouseSettings } from '../../../store/settings';

const OPTS_clickRippleAnimate = {
    fill: 'none',
    radius: 25,
    strokeWidth: { 50: 0 },
    scale: { 0: 1 },
    angle: { 'rand(-35, -70)': 0 },
    duration: 300,
    left: 0,
    top: 0,
    easing: 'cubic.out',
    className: 'no-pointer',
};

const outercircle = new mojs.Shape({
    ...OPTS_clickRippleAnimate,
    stroke: 'cyan',
    opacity: 0.7,
});

const interCircle = new mojs.Shape({
    ...OPTS_clickRippleAnimate,
    radius: {0 : 15},
    stokeWidth: {30: 0},
    stroke: 'magenta',
    delay: 'rand(75, 150)',
    opacity: 0.7,
});

function clickRippleAnimate(e: MouseEvent, mouseSettings: MouseSettings, parent: HTMLElement = document.body, scale?: number, speed?: number){
    const finalScale = scale ?? mouseSettings.scale ?? 1.0;
    const finalSpeed = speed ?? mouseSettings.speed ?? 1.0;
    outercircle.parent = parent;
    interCircle.parent = parent;
    outercircle.setSpeed(finalSpeed);
    interCircle.setSpeed(finalSpeed);
    outercircle.tune({ x: e.pageX, y: e.pageY, scale: {0:finalScale} }).replay();
    interCircle.tune({ x: e.pageX, y: e.pageY, scale: {0:finalScale} }).replay();
}

const burst1 = new mojs.Burst({
    left:0,
    top:0,
    radius: {0:60},
    count: 7,
    children: {
        duration: 390,
    }
});

function clickFirework(e: MouseEvent, mouseSettings: MouseSettings, parent: HTMLElement = document.body, scale?: number, speed?: number){
    const finalScale = scale ?? mouseSettings.scale ?? 1.0;
    const finalSpeed = speed ?? mouseSettings.speed ?? 1.0;
    burst1.parent = parent;
    burst1.setSpeed(finalSpeed);
    burst1.tune({ x: e.pageX, y: e.pageY, scale: finalScale }).replay();
}

const burst2 = new mojs.Burst({
    left:0,
    top:0,
    radius: {0:100},
    count: 7,
    rotate: {0: 90},
    opacity: {1: 0},
});

function clickSpiral(e: MouseEvent, mouseSettings: MouseSettings, parent: HTMLElement = document.body, scale?: number, speed?: number){
    const finalScale = scale ?? mouseSettings.scale ?? 1.0;
    const finalSpeed = speed ?? mouseSettings.speed ?? 1.0;
    burst2.parent = parent;
    burst2.setSpeed(finalSpeed);
    burst2.tune({ x: e.pageX, y: e.pageY, scale: finalScale }).replay();
}


const circleStroke = new mojs.Shape({
    left: 0,
    top: 0,
    shape: 'circle',
    fill: 'none',
    stroke: 'cyan',
    strokeWidth: 3,
    strokeDasharray: '100%',
    strokeDashoffset: {'100%': '0%'},
    rotate: -30,
    radius: 20,
    duration: 300,
    easing: 'sin.out',
    className: 'no-pointer',
}).then({
    strokeWidth: 0,
    stroke: 'lightgreen'
})

function clickCircleStroke(e: MouseEvent, mouseSettings: MouseSettings, parent: HTMLElement = document.body, scale?: number, speed?: number){
    const finalScale = scale ?? mouseSettings.scale ?? 1.0;
    const finalSpeed = speed ?? mouseSettings.speed ?? 1.0;
    circleStroke.parent = parent;
    circleStroke.setSpeed(1.5 * finalSpeed);
    circleStroke.tune({ x: e.pageX, y: e.pageY, scale: finalScale }).replay();
}


const rectStroke = new mojs.Shape({
    left: 0,
    top: 0,
    shape: 'rect',
    fill: 'none',
    stroke: 'magenta',
    strokeWidth: 3,
    strokeDasharray: '100%',
    strokeDashoffset: {'100%': '0%'},
    radius: 15,
    duration: 300,
    easing: 'sin.out',
    className: 'no-pointer',
}).then({
    strokeWidth: 0,
    stroke: 'lightgreen'
})

function clickRectStroke(e: MouseEvent, mouseSettings: MouseSettings, parent: HTMLElement = document.body, scale?: number, speed?: number){
    const finalScale = scale ?? mouseSettings.scale ?? 1.0;
    const finalSpeed = speed ?? mouseSettings.speed ?? 1.0;
    rectStroke.parent = parent;
    rectStroke.setSpeed(1.5 * finalSpeed);
    rectStroke.tune({ x: e.pageX, y: e.pageY, scale: finalScale }).replay();
}

export { clickRippleAnimate, clickFirework, clickSpiral, clickCircleStroke, clickRectStroke };
