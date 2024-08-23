import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import * as _ from 'lodash';
import { isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';  // Ensure RouterModule is imported


@Component({
  selector: 'app-homepage',
  standalone: true,
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css'],
  imports: [
    RouterModule  // Ensure RouterModule is included in imports
  ]
})
export class HomepageComponent implements OnInit, OnDestroy {
  private animationFrameId: any;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeAnimation();
    }
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.clearExistingCanvas();
  }

  private initializeAnimation() {
    const App: any = {};

    App.setup = function() {
      const canvas = document.createElement('canvas');
      this.filename = 'spipa';
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.canvas = canvas;
      document.getElementsByTagName('body')[0].appendChild(canvas);
      this.ctx = this.canvas.getContext('2d');
      this.width = this.canvas.width;
      this.height = this.canvas.height;
      this.dataToImageRatio = 1;
      this.ctx.imageSmoothingEnabled = false;
      this.xC = this.width / 2;
      this.yC = this.height / 2;

      this.stepCount = 0;
      this.particles = [];
      this.lifespan = 1000;
      this.popPerBirth = 1;
      this.maxPop = 300;
      this.birthFreq = 2;

      // Build grid
      this.gridSize = 8;
      this.gridSteps = Math.floor(1000 / this.gridSize);
      this.grid = [];
      let i = 0;
      for (let xx = -500; xx < 500; xx += this.gridSize) {
        for (let yy = -500; yy < 500; yy += this.gridSize) {
          const r = Math.sqrt(xx * xx + yy * yy);
          const r0 = 100;
          let field;

          if (r < r0) field = 255 / r0 * r;
          else if (r > r0) field = 255 - Math.min(255, (r - r0) / 2);

          this.grid.push({
            x: xx,
            y: yy,
            busyAge: 0,
            spotIndex: i,
            isEdge: (xx === -500 ? 'left' :
              (xx === (-500 + this.gridSize * (this.gridSteps - 1)) ? 'right' :
                (yy === -500 ? 'top' :
                  (yy === (-500 + this.gridSize * (this.gridSteps - 1)) ? 'bottom' :
                    false
                  )
                )
              )
            ),
            field: field
          });
          i++;
        }
      }
      this.gridMaxIndex = i;

      this.drawnInLastFrame = 0;
      this.deathCount = 0;

      this.initDraw();
    };

    App.evolve = function() {
      const time1 = performance.now();

      this.stepCount++;

      this.grid.forEach(function(e: any) {
        if (e.busyAge > 0) e.busyAge++;
      });

      if (this.stepCount % this.birthFreq === 0 && (this.particles.length + this.popPerBirth) < this.maxPop) {
        this.birth();
      }
      App.move();
      App.draw();

      const time2 = performance.now();

      // Update UI safely
      const deadElement = document.getElementsByClassName('dead')[0];
      const aliveElement = document.getElementsByClassName('alive')[0];
      const fpsElement = document.getElementsByClassName('fps')[0];
      const drawnElement = document.getElementsByClassName('drawn')[0];

      if (deadElement) deadElement.textContent = this.deathCount;
      if (aliveElement) aliveElement.textContent = this.particles.length;
      if (fpsElement) fpsElement.textContent = Math.floor(1000 / (time2 - time1)).toString();
      if (drawnElement) drawnElement.textContent = this.drawnInLastFrame;
    };

    App.birth = function() {
      let x, y;
      const gridSpotIndex = Math.floor(Math.random() * this.gridMaxIndex),
        gridSpot = this.grid[gridSpotIndex];
      x = gridSpot.x;
      y = gridSpot.y;

      const particle = {
        hue: 200,
        sat: 95,
        lum: 20 + Math.floor(40 * Math.random()),
        x: x,
        y: y,
        xLast: x,
        yLast: y,
        xSpeed: 0,
        ySpeed: 0,
        age: 0,
        ageSinceStuck: 0,
        attractor: {
          oldIndex: gridSpotIndex,
          gridSpotIndex: gridSpotIndex,
        },
        name: 'seed-' + Math.ceil(10000000 * Math.random())
      };
      this.particles.push(particle);
    };

    App.kill = function(particleName: string) {
      const newArray = _.reject(this.particles, function(seed: any) {
        return (seed.name === particleName);
      });
      this.particles = _.cloneDeep(newArray);
    };

    App.move = function() {
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];

        p.xLast = p.x;
        p.yLast = p.y;

        const index = p.attractor.gridSpotIndex,
          gridSpot = this.grid[index];

        if (Math.random() < 0.5) {
          if (!gridSpot.isEdge) {
            const topIndex = index - 1,
              bottomIndex = index + 1,
              leftIndex = index - this.gridSteps,
              rightIndex = index + this.gridSteps,
              topSpot = this.grid[topIndex],
              bottomSpot = this.grid[bottomIndex],
              leftSpot = this.grid[leftIndex],
              rightSpot = this.grid[rightIndex];

            const chaos = 30;
            const maxFieldSpot = _.maxBy([topSpot, bottomSpot, leftSpot, rightSpot], function(e: any) {
              return e.field + chaos * Math.random();
            });

            const potentialNewGridSpot = maxFieldSpot;
            if (potentialNewGridSpot.busyAge === 0 || potentialNewGridSpot.busyAge > 15) {
              p.ageSinceStuck = 0;
              p.attractor.oldIndex = index;
              p.attractor.gridSpotIndex = potentialNewGridSpot.spotIndex;
              gridSpot.busyAge = 1;
            } else p.ageSinceStuck++;

          } else p.ageSinceStuck++;

          if (p.ageSinceStuck === 10) this.kill(p.name);
        }

        const k = 8,
          visc = 0.4;
        const dx = p.x - gridSpot.x,
          dy = p.y - gridSpot.y,
          dist = Math.sqrt(dx * dx + dy * dy);

        const xAcc = -k * dx,
          yAcc = -k * dy;

        p.xSpeed += xAcc;
        p.ySpeed += yAcc;

        p.xSpeed *= visc;
        p.ySpeed *= visc;

        p.speed = Math.sqrt(p.xSpeed * p.xSpeed + p.ySpeed * p.ySpeed);
        p.dist = dist;

        p.x += 0.1 * p.xSpeed;
        p.y += 0.1 * p.ySpeed;

        p.age++;

        if (p.age > this.lifespan) {
          this.kill(p.name);
          this.deathCount++;
        }
      }
    };

    App.initDraw = function() {
      this.ctx.beginPath();
      this.ctx.rect(0, 0, this.width, this.height);
      this.ctx.fillStyle = 'black';
      this.ctx.fill();
      this.ctx.closePath();
    };

    App.draw = function() {
      this.drawnInLastFrame = 0;
      if (!this.particles.length) return false;

      this.ctx.beginPath();
      this.ctx.rect(0, 0, this.width, this.height);
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      this.ctx.fill();
      this.ctx.closePath();

      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];

        const h = p.hue + this.stepCount / 30;
        const s = p.sat;
        const l = p.lum;
        const a = 1;

        const last = this.dataXYtoCanvasXY(p.xLast, p.yLast);
        const now = this.dataXYtoCanvasXY(p.x, p.y);
        const attracSpot = this.grid[p.attractor.gridSpotIndex];
        const attracXY = this.dataXYtoCanvasXY(attracSpot.x, attracSpot.y);
        const oldAttracSpot = this.grid[p.attractor.oldIndex];
        const oldAttracXY = this.dataXYtoCanvasXY(oldAttracSpot.x, oldAttracSpot.y);

        this.ctx.beginPath();

        this.ctx.strokeStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
        this.ctx.fillStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';

        this.ctx.moveTo(last.x, last.y);
        this.ctx.lineTo(now.x, now.y);

        this.ctx.lineWidth = 1.5 * this.dataToImageRatio;
        this.ctx.stroke();
        this.ctx.closePath();

        this.ctx.beginPath();
        this.ctx.lineWidth = 1.5 * this.dataToImageRatio;
        this.ctx.moveTo(oldAttracXY.x, oldAttracXY.y);
        this.ctx.lineTo(attracXY.x, attracXY.y);
        this.ctx.arc(attracXY.x, attracXY.y, 1.5 * this.dataToImageRatio, 0, 2 * Math.PI, false);

        this.ctx.strokeStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
        this.ctx.fillStyle = 'hsla(' + h + ', ' + s + '%, ' + l + '%, ' + a + ')';
        this.ctx.stroke();
        this.ctx.fill();

        this.ctx.closePath();

        this.drawnInLastFrame++;
      }

      return; 
    };

    App.dataXYtoCanvasXY = function(x: number, y: number) {
      const zoom = 1.6;
      const xx = this.xC + x * zoom * this.dataToImageRatio;
      const yy = this.yC + y * zoom * this.dataToImageRatio;

      return { x: xx, y: yy };
    };

    this.clearExistingCanvas();
    App.setup();
    App.draw();

    const frame = () => {
      App.evolve();
      this.animationFrameId = requestAnimationFrame(frame);
    };
    frame();
  }

  private clearExistingCanvas() {
    if (isPlatformBrowser(this.platformId)) {
      const canvas = document.querySelector('canvas');
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }
}
