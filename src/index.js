import events from 'events';
import { config, errorsLang, EVENTS } from "./constants";
import { closeSVGIcon } from './assets/svg';
import { getCSS } from './assets/css';
import queryStringLib from 'query-string'
import { version } from "../package.json"

const eventEmitter = new events.EventEmitter();

function DriskSDK(partnerData) {
    this.sdkVersion = version;
    this.partnerData = partnerData;
    this.isInitialised = false;
    this.EVENTS = EVENTS;
    this.ALL_EVENTS = '*';
    this.ERROR = 'DRISK_ERROR'

    console.log("[SDK] Version: ", this.sdkVersion);
}

DriskSDK.prototype.on = function (type, cb) {
    if (type === this.ALL_EVENTS) {
        for (let eventName in EVENTS) {
            eventEmitter.on(EVENTS[eventName], cb);
        }
    }
    if (EVENTS[type]) eventEmitter.on(type, cb);
    if (type === this.ERROR) eventEmitter.on(this.ERROR, cb);
}
DriskSDK.prototype.init = function () {
    this.modal(this);
}
DriskSDK.prototype.close = async function () {
    let modal = document.getElementById("dRiskIframeId");
    if (modal && modal.style) {
        modal.style.display = "none";
        modal.innerHTML = "";
        await modal.remove();
    }
}
DriskSDK.prototype.closeRequest = function () {
    let iframeEl = document.getElementById('driskBuyCoverWidget');
    console.log("[SDK] closeRequest called", iframeEl);
    if (iframeEl) iframeEl.contentWindow.postMessage({
        event_id: EVENTS.DRISK_WIDGET_CLOSE_REQUEST,
        data: true
    }, '*');
}
DriskSDK.prototype.modal = async function () {
    try {
        if (this.partnerData) {
            let { url, width, height, partnerData } = await generateURL({ ...this.partnerData, sdkVersion: this.sdkVersion });
            console.log("[SDK]", {url, partnerData});
            let wrapper = document.createElement('div');
            wrapper.id = "dRiskIframeId";
            wrapper.innerHTML = `<div class="drisk_modal-overlay" id="drisk_modal-overlay"></div><div class="drisk_modal" id="drisk_modal"><div class="drisk_modal-content"><span class="drisk_close">${closeSVGIcon}</span><div class="driskContainer"><iframe id="driskBuyCoverWidget" allow="camera;fullscreen;accelerometer;gyroscope;magnetometer" allowFullScreen src="${url}" style="width: ${width}; height: ${height}"></iframe></div></div></div>`;
            let container = document.getElementsByTagName("body");
            if (!container) container = document.getElementsByTagName("html");
            if (!container) container = document.getElementsByTagName("div");
            await container[0].appendChild(wrapper);
            await setStyle(this.partnerData.themeColor, width, height);
            let modal = document.getElementById("dRiskIframeId");
            let span = document.getElementsByClassName("drisk_close")[0];

            //Prevent background scrolling when overlay appears
            document.documentElement.style.overflow = 'hidden';
            document.body.scroll = "no";

            if (modal && modal.style) modal.style.display = "block";
            this.isInitialised = true;
            eventEmitter.emit(EVENTS.DRISK_WIDGET_INITIALISED, {
                status: true,
                eventName: EVENTS.DRISK_WIDGET_INITIALISED
            });
            // When the user clicks on <span> (x), close the modal
            span.onclick = () => {
                return this.closeRequest()
            }
            // When the user clicks anywhere outside of the modal, close it
            window.onclick = (event) => {
                if (event.target === document.getElementById("drisk_modal-overlay")) this.closeRequest()
            }
            if (window.addEventListener) window.addEventListener("message", handleMessage);
            else window.attachEvent("onmessage", handleMessage);
        }
    } catch (e) {
        throw (e)
    }
}

async function generateURL(configData) {
    let partnerData = {}, environment = 'development', queryString = "", width = "100%", height = "100%";
    if (configData) {
        configData.hostURL = window.location.origin;
        if (configData.apiKey) {
            if (configData.environment) {
                if (config.ENVIRONMENT[configData.environment]) environment = config.ENVIRONMENT[configData.environment].NAME
            }
            try {
                environment = environment.toUpperCase();
                Object.keys(configData).map((key) => {
                    if (configData[key] instanceof Object) {
                        partnerData[key] = JSON.stringify(configData[key]);
                    } else partnerData[key] = configData[key];
                });
                queryString = queryStringLib.stringify(partnerData, { arrayFormat: 'comma' });
            } catch (e) {
                throw (e)
            }
        }
        else throw (errorsLang.ENTER_API_KEY);
        if (configData.widgetWidth) width = configData.widgetWidth;
        if (configData.widgetHeight) height = configData.widgetHeight;
    }
    return { width, height, partnerData, url: `${config.ENVIRONMENT[environment].FRONTEND}/buycover?${queryString}` }
}

async function setStyle(themeColor, width, height) {
    let style = await document.createElement('style');
    style.innerHTML = getCSS(themeColor, height, width);
    let modal = document.getElementById("dRiskIframeId");
    if (modal) await modal.appendChild(style);
}

function handleMessage(event) {
    console.log("[SDK] handleMessage Called", {event});
    let environment;
    if (event.origin === config.ENVIRONMENT.LOCAL_DEVELOPMENT.FRONTEND) environment = config.ENVIRONMENT.LOCAL_DEVELOPMENT.NAME;
    else if (event.origin === config.ENVIRONMENT.PRODUCTION.FRONTEND) environment = config.ENVIRONMENT.PRODUCTION.NAME;
    else if (event.origin === config.ENVIRONMENT.STAGING.FRONTEND) environment = config.ENVIRONMENT.STAGING.NAME;

    if (environment) {
        if (event && event.data && event.data.event_id) {
            switch (event.data.event_id) {
                case EVENTS.DRISK_WIDGET_CLOSE: {
                    eventEmitter.emit(EVENTS.DRISK_WIDGET_CLOSE, {
                        status: true,
                        eventName: EVENTS.DRISK_WIDGET_CLOSE
                    });

                    //enable background scrolling when overlay appears
                    document.documentElement.style.overflow = 'scroll';
                    document.body.scroll = "yes";
                    let modal = document.getElementById("dRiskIframeId");
                    if (modal && modal.style) {
                        modal.style.display = "none";
                        modal.innerHTML = "";
                        modal.remove();
                    }
                    break;
                }
                case EVENTS.DRISK_COVER_PURCHASE_SUCCESS: {
                    eventEmitter.emit(EVENTS.DRISK_COVER_PURCHASE_SUCCESS, {
                        status: event.data.data,
                        eventName: EVENTS.DRISK_COVER_PURCHASE_SUCCESS
                    });
                    break;
                }
                case EVENTS.DRISK_COVER_PURCHASE_FAILED: {
                    eventEmitter.emit(EVENTS.DRISK_COVER_PURCHASE_FAILED, {
                        status: event.data.data,
                        eventName: EVENTS.DRISK_COVER_PURCHASE_FAILED
                    });
                    break;
                }
                case EVENTS.DRISK_ORDER_FAILED: {
                    eventEmitter.emit(EVENTS.DRISK_ORDER_FAILED, {
                        status: event.data.data,
                        eventName: EVENTS.DRISK_ORDER_FAILED
                    });
                    break;
                }
                case EVENTS.DRISK_COVER_CANCELLATION_SUCCESS: {
                    eventEmitter.emit(EVENTS.DRISK_COVER_CANCELLATION_SUCCESS, {
                        status: event.data.data,
                        eventName: EVENTS.DRISK_COVER_CANCELLATION_SUCCESS
                    });
                    break;
                }
                case EVENTS.DRISK_COVER_CANCELLATION_FAILED: {
                    eventEmitter.emit(EVENTS.DRISK_COVER_CANCELLATION_FAILED, {
                        status: event.data.data,
                        eventName: EVENTS.DRISK_COVER_CANCELLATION_FAILED
                    });
                    break;
                }
                case EVENTS.DRISK_CLAIM_SUCCESS: {
                    eventEmitter.emit(EVENTS.DRISK_CLAIM_SUCCESS, {
                        status: event.data.data,
                        eventName: EVENTS.DRISK_CLAIM_SUCCESS
                    });
                    break;
                }
                case EVENTS.DRISK_CLAIM_FAILED: {
                    eventEmitter.emit(EVENTS.DRISK_CLAIM_FAILED, {
                        status: event.data.data,
                        eventName: EVENTS.DRISK_CLAIM_FAILED
                    });
                    break;
                }
                case EVENTS.DRISK_WIDGET_OPEN: {
                    eventEmitter.emit(EVENTS.DRISK_WIDGET_OPEN, {
                        status: true,
                        eventName: EVENTS.DRISK_WIDGET_OPEN
                    });
                    break;
                }
                default: {
                }
            }
        }
    }
}

export default DriskSDK


