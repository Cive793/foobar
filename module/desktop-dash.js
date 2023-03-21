"use strict";
import { loadSvg, loadCustomerSvgs, loadQueueSvgs } from "./load-dashboard-svg";
import { getBartenderAndTap } from "./bartender-to-bar";
import { moveBartenderToCounter } from "./bartender-to-counter";
import { getBartenderSpotAtCounter } from "./get-bartender";
import { importBartenderSvg } from "./import-bartender-svg";
import { startTap, removePreviousTap } from "./get-tap";
import { toggleCustomer } from "./desktop-dash-customers.js";
import { createQueue } from "./desktop-dash-queue";

window.addEventListener("DOMContentLoaded", start);

let bartenders = [
  {
    btName: "Klaus",
    btStatus: "",
  },
  {
    btName: "Jonas",
    btStatus: "",
  },
  {
    btName: "Peter",
    btStatus: "",
  },
  {
    btName: "Dannie",
    btStatus: "",
  },
];

let customerSvgs = [];
let queueSvgs = [];

async function start() {
  console.log("start");
  await loadSvg();
  customerSvgs = await loadCustomerSvgs();
  queueSvgs = await loadQueueSvgs();
  loadDynamicData();
}

export function getCustomerSvgs() {
  return customerSvgs;
}

function loadDynamicData() {
  const url = "https://hangover3.herokuapp.com/";
  fetch(url)
    .then((res) => res.json())
    .then((data) => getData(data));
  setTimeout(loadDynamicData, 1000);
}

function getData(data) {
  const bartendersData = data.bartenders;
  //create queue if there is queue
  if (data.queue.length !== 0) {
    createQueue(data.queue, queueSvgs);
  }
  bartendersData.forEach((bartender) => {
    getBartenderStatus(bartender);
    showBartenderData(bartender);
  });
}

function getBartenderStatus(bartender) {
  const bartenderName = bartender.name;
  const newStatus = bartender.statusDetail;
  //match bartender in global variable
  bartenders.forEach((bt) => {
    if (bt.btName === bartenderName) {
      const oldStatus = bt.btStatus;
      const btSpotAtCounter = getBartenderSpotAtCounter(bartender);
      console.log(bt.btName, "old Status:", oldStatus);
      if (oldStatus === "") {
        console.log("there is no oldStatus yet");
        //import bt based on the newStatus only
        if (newStatus === "reserveTap" || newStatus === "replaceKeg" || newStatus === "receivePayment") {
          importBartenderSvg(bartender, "leaning", btSpotAtCounter.element);
          toggleCustomer(bartender);
          bt.btStatus = newStatus;
        } else if (newStatus === "startServing") {
          importBartenderSvg(bartender, "start-serving", btSpotAtCounter.element);
          toggleCustomer(bartender);
          bt.btStatus = newStatus;
        } else if (newStatus === "pourBeer") {
          importBartenderSvg(bartender, "pouring");
          toggleCustomer(bartender);
          startTap(bartender);
          //TODO:
          //get tap element
          //unhide beer glass g
          //start pouring animation

          bt.btStatus = newStatus;
        } else if (newStatus === "releaseTap") {
          importBartenderSvg(bartender, "leaning", btSpotAtCounter.element);
          // TODO:
          //get tap element
          //hide tap if newStatus === "releaseTap"

          //cheat the system
          bt.btStatus = "";
        } else if (newStatus === "waiting") {
          importBartenderSvg(bartender, "leaning", btSpotAtCounter.element);
          bt.btStatus = newStatus;
        }
        //TODO: if newStatus === "replaceKeg"
      } else {
        if ((oldStatus === "startServing" || oldStatus === "waiting" || oldStatus === "reserveTap") && newStatus === "pourBeer") {
          console.log("move bartender to bar");
          getBartenderAndTap(bartender, "first");
        } else if (oldStatus === "pourBeer" && newStatus === "releaseTap") {
          //TODO
          //hide handle
          removePreviousTap(bartender);
          //stop tap "pouring" animation
        }
        //backup if releaseTap is not registered
        else if (oldStatus === "pourBeer" && newStatus === "receivePayment") {
          removePreviousTap(bartender);
          moveBartenderToCounter(bartender);
        } else if (oldStatus === "startServing" && newStatus === "reserveTap") {
          //change display to "bt-leaning"
          importBartenderSvg(bartender, "leaning", btSpotAtCounter.element);
        } else if (oldStatus !== "startServing" && newStatus === "startServing") {
          importBartenderSvg(bartender, "start-serving", btSpotAtCounter.element);
          //showCustomer
          toggleCustomer(bartender);
        } else if (oldStatus !== "waiting" && newStatus === "waiting") {
          //change display to "bt-leaning"
          importBartenderSvg(bartender, "leaning", btSpotAtCounter.element);
          //hide customer
          toggleCustomer(bartender);
        } else if (oldStatus === "releaseTap") {
          removePreviousTap(bartender);
          if (newStatus === "pourBeer") {
            getBartenderAndTap(bartender, "not first");
          }
          // backup if newStatus is releaseTap again
          else if (newStatus === "releaseTap") {
            console.log(bartender.name, "is releasing the tap too long ");
          } else {
            moveBartenderToCounter(bartender);
          }
          //TODO: if newStatus === "replaceKeg"
        }
        //TODO: if oldStatus === "replaceKeg" && newStatus === "pourBeer"
        bt.btStatus = newStatus;
      }
      console.log(bt.btName, "new Status:", bt.btStatus);
    }
  });
}

function showBartenderData(bartender) {
  const row = document.querySelector(`.${bartender.name}-row`);
  //change data in row
  const nameCol = row.querySelector(`[data-bartender="name"]`);
  nameCol.textContent = bartender.name;
  const statusDetCol = row.querySelector(`[data-bartender="statusDetail"]`);
  statusDetCol.textContent = bartender.statusDetail;
  const tapCol = row.querySelector(`[data-bartender="usingTap"]`);
  tapCol.textContent = bartender.usingTap;
}
