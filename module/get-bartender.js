"use strict";

export function getBartenderAtBar(bartender) {
  const bartenderInDom = document.querySelector(`g#${bartender.name}_pouring`).closest("div.bt-pouring");
  const bartenderPosition = bartenderInDom.getBoundingClientRect();
  return { element: bartenderInDom, position: bartenderPosition };
}

export function getBartenderSpotAtCounter(bartender) {
  const counterContainerInDom = document.querySelector(`div#${bartender.name}`);
  const counterPosition = counterContainerInDom.getBoundingClientRect();
  return { element: counterContainerInDom, position: counterPosition };
}

export function getBartenderSpotAtBar(tap) {
  const tapNumberAsString = tap.toString();
  const tapInDom = document.querySelector(`.bt-pouring#bt-${tapNumberAsString}`);
  const tapPosition = tapInDom.getBoundingClientRect();
  return { element: tapInDom, position: tapPosition };
}
