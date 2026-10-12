(()=>{const globalKey="PurityHeaderAccountPopup",existingApi=window[globalKey];if(existingApi?.bindAccountPopups&&existingApi?.syncHeaderHeight){existingApi.syncHeaderHeight(),existingApi.bindAccountPopups(document);return}const root=document.documentElement,accountSelector=".header-account-popup shopify-account",accountShadowStyleId="purity-account-sheet-style",accountLoginShadowStyleId="purity-account-login-style",accountOverlayClass="purity-account-dialog-overlay",accountMobileSheetLayout="mobile-sheet",accountMobileSheetDialogClass="dialog-mobile-sheet",accountDialogActiveClass="dialog-active",accountDialogClosingClass="dialog-closing",accountDialogOpenDurationMs=200,accountDialogCloseDurationMs=300,accountDialogCloseEasing="cubic-bezier(0.5, -0.03, 0.34, 0.83)",accountInitialFocusGuardDurationMs=320,accountSheetCloseAnimationName="accountSheetClose",accountSheetCloseOffsetProperty="--account-sheet-close-offset",isRTL=document.documentElement.dir==="rtl",sheetDragThreshold=100,sheetDragResistance=.4,accountObservers=new WeakMap,accountDialogListeners=new WeakSet,accountCloseTimers=new WeakMap,accountOpenFrames=new WeakMap,accountNativeCloseBypass=new WeakSet,closingAccounts=new WeakSet,accountSheetDragStates=new WeakMap,accountInitialFocusGuardTimers=new WeakMap,accountInitialFocusSuppressUntil=new WeakMap,accountInitialFocusGuardRoots=new WeakSet,accountShadowStyles=`
    .dialog {
      --dialog-drawer-opening-animation: none;
      --dialog-drawer-closing-animation: none;
      box-sizing: border-box;
      position: fixed !important;
      inset: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100vw !important;
      max-width: none !important;
      height: 100dvh !important;
      max-height: none !important;
      margin: 0 !important;
      padding: 1.5rem !important;
      background: transparent !important;
      background-color: transparent !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      clip-path: none !important;
      overflow: visible !important;
      pointer-events: none;
    }

    .dialog[open] {
      animation: none !important;
    }

    .account,
    .account__header,
    .account__header-content,
    .account__content,
    .account__login-form-container,
    shopify-login-form,
    nav.stack-inline {
      box-sizing: border-box;
      min-width: 0;
    }

    .account__header,
    .account__header-content,
    .account__content,
    .account__login-form-container,
    shopify-login-form,
    nav.stack-inline {
      width: 100%;
    }

    .${accountOverlayClass} {
      background-color: #1d1d1f80;
      min-height: 100lvh;
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 1;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      cursor:
      url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="none"><rect width="60" height="60" fill="%23fff" rx="30"/><path fill="%231D1D1F" d="M22.348 23.93a1.02 1.02 0 0 1-.348-.778c0-.321.116-.598.348-.83.214-.215.481-.322.803-.322.32 0 .588.107.802.322L30 28.379l6.047-6.057c.214-.215.481-.322.803-.322.32 0 .588.107.802.322.232.232.348.509.348.83 0 .304-.116.563-.348.778l-6.047 6.057 6.047 6.057c.232.232.348.509.348.83 0 .304-.116.563-.348.778a1.046 1.046 0 0 1-.803.348c-.32 0-.588-.116-.802-.348L30 31.622l-6.047 6.03a1.046 1.046 0 0 1-.802.348c-.322 0-.59-.116-.803-.348a1.02 1.02 0 0 1-.348-.778c0-.321.116-.598.348-.83l6.047-6.057-6.047-6.057Z"/></svg>')
        30 30,
      pointer;      transition:
        opacity var(--dur-in, 0.5s) var(--ease-in, ease),
        visibility 0s linear var(--dur-in, 0.5s),
        background-color var(--dur-in, 0.5s) var(--ease-in, ease);
      transition-property: opacity, visibility, background-color;
    }

    .account {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      align-self: center;
      flex: 0 0 auto;
      width: min(var(--drawer-width, 48rem), calc(100vw - 3rem), 90vw);
      max-width: 100%;
      height: auto !important;
      min-height: 0 !important;
      max-height: min(80vh, calc(100dvh - 3rem));
      background: var(--shopify-account-color-background, #fff);
      border: 1px solid var(--shopify-account-color-border, rgba(29, 29, 31, 0.08));
      box-shadow: 0 0 24px 0 var(--shopify-account-color-shadow, rgba(0, 0, 0, 0.08));
      overflow: hidden;
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      will-change: transform, opacity;
      transform: scale(0.85);
      transform-origin: center center;
      transition:
        opacity ${accountDialogOpenDurationMs}ms ease,
        transform ${accountDialogOpenDurationMs}ms ease,
        visibility 0s linear ${accountDialogOpenDurationMs}ms;
      border-radius: var(--shopify-account-radius-dialog, 10px);
      clip-path: inset(0 0 0 0 round var(--shopify-account-radius-dialog, 10px));
      ${isRTL?"direction: rtl;":""}
    }

    .account__content,
    .account__login-form-container,
    shopify-login-form {
      display: block;
      height: auto !important;
      min-height: 0 !important;
      flex: 0 1 auto;
    }

    nav.stack-inline {
      align-self: stretch;
    }

    .dialog::backdrop {
      background: transparent !important;
      background-color: transparent !important;
      opacity: 0 !important;
      visibility: hidden !important;
      transition: none !important;
      animation: none !important;
    }

    .dialog[open].${accountDialogActiveClass} {
      pointer-events: auto;
    }

    .dialog[open].${accountDialogActiveClass} .${accountOverlayClass} {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transition-delay: 0s;
    }

    .dialog[open].${accountDialogActiveClass} .account {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
      transform: scale(1);
      transition-delay: 0s;
    }

    .dialog[open].${accountDialogClosingClass} {
      pointer-events: none;
    }

    .dialog[open].${accountDialogClosingClass} .${accountOverlayClass} {
      opacity: 0;
      visibility: hidden;
      transition:
        opacity var(--dur-out, 0.48s) var(--ease-in, ease),
        visibility 0s linear var(--dur-out, 0.48s),
        background-color var(--dur-out, 0.48s) var(--ease-in, ease);
      transition-property: opacity, visibility, background-color;
    }

    .dialog[open].${accountDialogClosingClass} .account {
      visibility: visible;
      pointer-events: none;
      transition: none;
      animation: zoomOut ${accountDialogCloseDurationMs}ms ${accountDialogCloseEasing} forwards;
    }

    @keyframes zoomOut {
      0% {
        transform: scale(1);
        opacity: 1;
        visibility: visible;
      }

      100% {
        transform: scale(0.8);
        opacity: 0;
        visibility: hidden;
      }
    }

    @keyframes ${accountSheetCloseAnimationName} {
      0% {
        transform: translateY(var(${accountSheetCloseOffsetProperty}, 0px));
      }

      100% {
        transform: translateY(calc(100% + 1rem));
      }
    }

    @media (min-width: 1025px) {
      .account {
        width: min(var(--drawer-width, 48rem), calc(100vw - 3rem), 90vw);
        max-height: 80vh;
      }
    }

    @media (max-width: 1024.98px) {
      .dialog {
        padding: 1.5rem !important;
      }

      .account {
        width: min(100%, calc(100vw - 3rem));
        max-height: calc(100dvh - 3rem);
      }

      .dialog.${accountMobileSheetDialogClass} {
        align-items: flex-end !important;
        justify-content: center !important;
        padding: 0 !important;
      }

      .dialog.${accountMobileSheetDialogClass} .account {
        align-self: flex-end;
        width: 100%;
        max-width: 100%;
        max-height: min(calc(100dvh - 0.75rem), 92dvh);
        border-width: 1px 0 0;
        border-radius: var(--drawer-rounded, var(--img-rounded)) var(--drawer-rounded, var(--img-rounded)) 0 0;
        clip-path: none;
        opacity: 1;
        transform: translateY(calc(100% + 1rem));
        transform-origin: center bottom;
        transition:
          transform ${accountDialogOpenDurationMs}ms ease,
          visibility 0s linear ${accountDialogOpenDurationMs}ms;
      }

      .dialog.${accountMobileSheetDialogClass} .account__header {
        position: relative;
        cursor: grab;
        padding-top: 2.2rem;
      }

      .dialog.${accountMobileSheetDialogClass} .account__header::before {
        content: '';
        position: absolute;
        inset-inline-start: 50%;
        inset-block-start: 0.9rem;
        width: 4.2rem;
        height: 0.4rem;
        border-radius: 999px;
        background: rgba(29, 29, 31, 0.15);
        transform: translateX(-50%);
      }

      .dialog[open].${accountDialogActiveClass}.${accountMobileSheetDialogClass} .account {
        visibility: visible;
        pointer-events: auto;
        transform: translateY(0);
      }

      .dialog[open].${accountDialogClosingClass}.${accountMobileSheetDialogClass} .account {
        opacity: 1;
        visibility: visible;
        pointer-events: none;
        transition: none;
        animation: ${accountSheetCloseAnimationName} ${accountDialogCloseDurationMs}ms ${accountDialogCloseEasing} forwards;
      }

      .dialog.${accountMobileSheetDialogClass}.is-dragging .account {
        transition: none !important;
      }
    }
  `,accountLoginShadowStyles=`
    :host {
      display: block;
      width: 100%;
      min-width: 0;
    }

    #shopify-element-wrapper,
    .account__login-form,
    .account__email-form,
    .account__email-input-wrapper {
      box-sizing: border-box;
      width: 100%;
      min-width: 0;
    }
  `,syncHeaderHeight=()=>{const header=document.querySelector(".header-site");header&&requestAnimationFrame(()=>{const height=header.getBoundingClientRect().height||0;document.body.style.setProperty("--header-height",`${Math.ceil(height)}px`)})},shouldPreserveNonAccountScrollLock=()=>!!(root.classList.contains("open-modal")||root.classList.contains("open-modal-shopable-video")||root.classList.contains("open-modal-offer-popup")||document.querySelector(".active-modal-js.active")),syncAccountScrollLockState=hasOpenAccountSheet=>{hasOpenAccountSheet&&(shouldPreserveNonAccountScrollLock()||(removeInlineLockStyle(root,"overflow",["hidden"]),removeInlineLockStyle(root,"touch-action",["none"]),removeInlineLockStyle(root,"scrollbar-gutter",["stable"]),removeInlineLockStyle(document.body,"touch-action",["none"])))},getAccountDialog=account=>{const shadowRoot=account?.shadowRoot;return shadowRoot?shadowRoot.querySelector("dialog"):null},getAccountPanel=account=>{const shadowRoot=account?.shadowRoot;return shadowRoot?shadowRoot.querySelector(".account"):null},getAccountCloseTrigger=account=>{const shadowRoot=account?.shadowRoot;return shadowRoot?shadowRoot.querySelector('#close-button, .account__close, button[aria-label="Close menu"]'):null},isMobileSheetAccount=account=>account?.dataset?.accountPopupLayout===accountMobileSheetLayout,shouldUseMobileSheet=account=>isMobileSheetAccount(account)&&window.innerWidth<=1024,clearAccountSheetOffset=accountPanel=>{accountPanel instanceof HTMLElement&&(accountPanel.style.removeProperty(accountSheetCloseOffsetProperty),accountPanel.style.removeProperty("transform"),accountPanel.style.removeProperty("transition"),accountPanel.style.removeProperty("will-change"))},syncAccountDialogLayout=account=>{const dialog=getAccountDialog(account);if(!(dialog instanceof HTMLDialogElement))return;const useMobileSheet=shouldUseMobileSheet(account);dialog.classList.toggle(accountMobileSheetDialogClass,useMobileSheet),useMobileSheet||(dialog.classList.remove("is-dragging"),clearAccountSheetOffset(getAccountPanel(account)))},getDeepActiveElement=rootNode=>{let activeElement=rootNode?.activeElement||null;for(;activeElement?.shadowRoot?.activeElement;)activeElement=activeElement.shadowRoot.activeElement;return activeElement},shouldSuppressInitialAccountFieldFocus=account=>(accountInitialFocusSuppressUntil.get(account)||0)>Date.now(),toggleAccountInitialFocusSuppression=(account,suppressed)=>{const dialog=getAccountDialog(account);if(!(dialog instanceof HTMLDialogElement))return;dialog.querySelectorAll(".account__content, .account__login-form-container, shopify-login-form").forEach(target=>{target instanceof HTMLElement&&(target.inert=suppressed,suppressed?target.setAttribute("data-initial-focus-suppressed","true"):target.removeAttribute("data-initial-focus-suppressed"))})},clearInitialAccountFieldFocusGuard=account=>{const timerId=accountInitialFocusGuardTimers.get(account);timerId!=null&&(window.clearTimeout(timerId),accountInitialFocusGuardTimers.delete(account)),accountInitialFocusSuppressUntil.delete(account),toggleAccountInitialFocusSuppression(account,!1)},preventInitialAccountFieldFocus=account=>{const shadowRoot=account?.shadowRoot;if(!shadowRoot)return;const dialog=getAccountDialog(account);if(!(dialog instanceof HTMLDialogElement)||!dialog.hasAttribute("open"))return;const activeElement=getDeepActiveElement(shadowRoot);if(!(activeElement instanceof HTMLElement)||!activeElement.matches('input, textarea, select, [contenteditable="true"]'))return;activeElement.blur();const fallbackFocusTarget=getAccountCloseTrigger(account)||getAccountPanel(account)||dialog;fallbackFocusTarget instanceof HTMLElement&&(fallbackFocusTarget.hasAttribute("tabindex")||fallbackFocusTarget.setAttribute("tabindex","-1"),fallbackFocusTarget.focus({preventScroll:!0}))},handleInitialAccountFieldFocus=account=>{shouldSuppressInitialAccountFieldFocus(account)&&window.setTimeout(()=>{preventInitialAccountFieldFocus(account)},0)},armInitialAccountFieldFocusGuard=account=>{clearInitialAccountFieldFocusGuard(account),accountInitialFocusSuppressUntil.set(account,Date.now()+accountInitialFocusGuardDurationMs),toggleAccountInitialFocusSuppression(account,!0),window.setTimeout(()=>{preventInitialAccountFieldFocus(account)},0),accountInitialFocusGuardTimers.set(account,window.setTimeout(()=>{clearInitialAccountFieldFocusGuard(account)},accountInitialFocusGuardDurationMs))},shouldPreserveDocumentScrollLock=()=>root.classList.contains("open-modal-account")||root.classList.contains("open-modal")||root.classList.contains("open-modal-shopable-video")||root.classList.contains("open-modal-offer-popup")||document.querySelector(".active-modal-js.active")?!0:[...document.querySelectorAll(accountSelector)].some(account=>account?.dataset?.accountSheetClosing==="true"||isAccountSheetOpen(account)),removeInlineLockStyle=(element,property,expectedValues=[])=>{if(!element?.style)return;const value=element.style.getPropertyValue(property).trim();value&&(expectedValues.length>0&&!expectedValues.includes(value)||element.style.removeProperty(property))},releaseAccountScrollLock=()=>{shouldPreserveDocumentScrollLock()||(removeInlineLockStyle(root,"overflow",["hidden"]),removeInlineLockStyle(root,"touch-action",["none"]),removeInlineLockStyle(root,"scrollbar-gutter",["stable"]),removeInlineLockStyle(document.body,"overflow",["hidden"]),removeInlineLockStyle(document.body,"touch-action",["none"]))},scheduleAccountScrollLockCleanup=()=>{window.requestAnimationFrame(()=>{releaseAccountScrollLock(),window.setTimeout(releaseAccountScrollLock,0)})},requestNativeAccountClose=account=>{const dialog=getAccountDialog(account);if(!(dialog instanceof HTMLDialogElement))return!1;const closeTrigger=getAccountCloseTrigger(account);return closeTrigger instanceof HTMLElement?(accountNativeCloseBypass.add(account),closeTrigger.click(),window.requestAnimationFrame(()=>{accountNativeCloseBypass.delete(account)}),!0):typeof dialog.requestClose=="function"?(dialog.requestClose(),!0):(dialog.close(),!0)},ensureAccountDialogStructure=account=>{const dialog=getAccountDialog(account);if(!(dialog instanceof HTMLDialogElement)||dialog.querySelector(`.${accountOverlayClass}`))return;const overlay=document.createElement("div");overlay.className=accountOverlayClass,overlay.setAttribute("aria-hidden","true"),dialog.prepend(overlay)},getDialogAnimationDuration=()=>accountDialogCloseDurationMs,getAccountCloseAnimationName=account=>{const dialog=getAccountDialog(account);return dialog instanceof HTMLDialogElement&&dialog.classList.contains(accountMobileSheetDialogClass)?accountSheetCloseAnimationName:"zoomOut"},ensureAccountSheetDrag=account=>{const shadowRoot=account?.shadowRoot;if(!shadowRoot||accountSheetDragStates.has(account))return;const state={isDragging:!1,startY:0,currentY:0},startDrag=event=>{if(!shouldUseMobileSheet(account))return;const dialog=getAccountDialog(account),accountPanel=getAccountPanel(account);if(!(dialog instanceof HTMLDialogElement)||!(accountPanel instanceof HTMLElement)||!dialog.hasAttribute("open"))return;const target=event.target;target instanceof Element&&target.closest(".account__header")&&(target.closest('#close-button, .account__close, button[aria-label="Close menu"]')||(state.isDragging=!0,state.startY=event.type.includes("mouse")?event.clientY:event.touches[0].clientY,state.currentY=state.startY,dialog.classList.add("is-dragging"),accountPanel.style.transition="none",accountPanel.style.willChange="transform"))},onDrag=event=>{if(!state.isDragging||!shouldUseMobileSheet(account))return;const accountPanel=getAccountPanel(account);if(!(accountPanel instanceof HTMLElement))return;event.cancelable&&event.preventDefault(),state.currentY=event.type.includes("mouse")?event.clientY:event.touches[0].clientY;const offset=Math.max(0,state.currentY-state.startY)*sheetDragResistance;accountPanel.style.setProperty(accountSheetCloseOffsetProperty,`${offset}px`),accountPanel.style.transform=`translateY(${offset}px)`},endDrag=()=>{if(!state.isDragging)return;state.isDragging=!1;const dialog=getAccountDialog(account),accountPanel=getAccountPanel(account);if(!(dialog instanceof HTMLDialogElement)||!(accountPanel instanceof HTMLElement))return;if(dialog.classList.remove("is-dragging"),Math.max(0,state.currentY-state.startY)>sheetDragThreshold){closeAccountPopup(account);return}accountPanel.style.transition="transform 0.1s ease-in-out",accountPanel.style.transform="",accountPanel.style.removeProperty(accountSheetCloseOffsetProperty),window.setTimeout(()=>{accountPanel.style.removeProperty("transition"),accountPanel.style.removeProperty("will-change")},120)};shadowRoot.addEventListener("touchstart",startDrag,{passive:!0}),shadowRoot.addEventListener("mousedown",startDrag),document.addEventListener("touchmove",onDrag,{passive:!1}),document.addEventListener("mousemove",onDrag),document.addEventListener("touchend",endDrag),document.addEventListener("mouseup",endDrag),accountSheetDragStates.set(account,state)},clearScheduledAccountOpen=account=>{const frameId=accountOpenFrames.get(account);frameId!=null&&(window.cancelAnimationFrame(frameId),accountOpenFrames.delete(account))},clearAccountCloseTimer=account=>{const closeState=accountCloseTimers.get(account);closeState&&(window.clearTimeout(closeState.timeoutId),closeState.animationTarget&&closeState.handleAnimationEnd&&closeState.animationTarget.removeEventListener("animationend",closeState.handleAnimationEnd),accountCloseTimers.delete(account))},queueAccountDialogOpen=account=>{const dialog=getAccountDialog(account);if(!(dialog instanceof HTMLDialogElement)||!dialog.hasAttribute("open")||dialog.classList.contains(accountDialogClosingClass))return;syncAccountDialogLayout(account),clearScheduledAccountOpen(account),clearAccountCloseTimer(account),dialog.classList.remove(accountDialogActiveClass),dialog.classList.remove(accountDialogClosingClass);const frameId=window.requestAnimationFrame(()=>{const activeDialog=getAccountDialog(account);accountOpenFrames.delete(account),!(!(activeDialog instanceof HTMLDialogElement)||!activeDialog.hasAttribute("open"))&&(syncAccountDialogLayout(account),activeDialog.classList.add(accountDialogActiveClass),armInitialAccountFieldFocusGuard(account))});accountOpenFrames.set(account,frameId)},ensureAccountDialogActive=account=>{const dialog=getAccountDialog(account);!(dialog instanceof HTMLDialogElement)||!dialog.hasAttribute("open")||accountOpenFrames.has(account)||dialog.classList.contains(accountDialogActiveClass)||dialog.classList.contains(accountDialogClosingClass)||queueAccountDialogOpen(account)},resetAccountDialogState=account=>{const dialog=getAccountDialog(account);dialog instanceof HTMLDialogElement&&(clearInitialAccountFieldFocusGuard(account),clearScheduledAccountOpen(account),dialog.classList.remove(accountDialogActiveClass),dialog.classList.remove(accountDialogClosingClass),dialog.classList.remove("is-dragging"),clearAccountSheetOffset(getAccountPanel(account)),syncAccountDialogLayout(account))},ensureAccountDialogInteractions=account=>{const shadowRoot=account?.shadowRoot;shadowRoot&&shadowRoot.querySelectorAll("dialog").forEach(dialog=>{accountDialogListeners.has(dialog)||(dialog.addEventListener("cancel",event=>{event.preventDefault(),closeAccountPopup(account)}),dialog.addEventListener("close",()=>{finishAccountPopupState(account,!1)}),accountDialogListeners.add(dialog))})},isAccountSheetOpen=account=>{const shadowRoot=account?.shadowRoot;return shadowRoot?shadowRoot.querySelector("dialog[open], [popover]:popover-open")!=null:account?.dataset.accountSheetOpen==="true"},syncAccountSheetState=()=>{const hasOpenAccountSheet=[...document.querySelectorAll(accountSelector)].some(account=>{const isOpen=isAccountSheetOpen(account);return account.dataset.accountSheetOpen=isOpen?"true":"false",isOpen});root.classList.toggle("open-modal-account",hasOpenAccountSheet),syncAccountScrollLockState(hasOpenAccountSheet)},startClosingAccountPopup=account=>{account&&(clearScheduledAccountOpen(account),closingAccounts.add(account),account.dataset.accountSheetClosing="true",syncAccountSheetState())},finishAccountPopupState=(account,isOpen)=>{account&&(clearScheduledAccountOpen(account),clearAccountCloseTimer(account),isOpen?(closingAccounts.delete(account),account.dataset.accountSheetClosing="false",account.dataset.accountSheetOpen="true",clearAccountSheetOffset(getAccountPanel(account)),syncAccountDialogLayout(account),queueAccountDialogOpen(account)):(closingAccounts.delete(account),account.dataset.accountSheetClosing="false",account.dataset.accountSheetOpen="false",resetAccountDialogState(account)),syncAccountSheetState(),isOpen||scheduleAccountScrollLockCleanup())},ensureAccountDialogStyles=account=>{const shadowRoot=account?.shadowRoot;if(!shadowRoot||shadowRoot.getElementById(accountShadowStyleId))return;const style=document.createElement("style");style.id=accountShadowStyleId,style.textContent=accountShadowStyles,shadowRoot.append(style)},ensureAccountLoginFormStyles=account=>{const shadowRoot=account?.shadowRoot;shadowRoot&&shadowRoot.querySelectorAll("shopify-login-form").forEach(loginForm=>{const loginShadowRoot=loginForm.shadowRoot;if(!loginShadowRoot||(accountInitialFocusGuardRoots.has(loginShadowRoot)||(loginShadowRoot.addEventListener("focusin",()=>{handleInitialAccountFieldFocus(account)}),accountInitialFocusGuardRoots.add(loginShadowRoot)),loginShadowRoot.getElementById(accountLoginShadowStyleId)))return;const style=document.createElement("style");style.id=accountLoginShadowStyleId,style.textContent=accountLoginShadowStyles,loginShadowRoot.append(style)})},observeAccountPopup=account=>{const shadowRoot=account?.shadowRoot;if(!shadowRoot||accountObservers.has(account))return;const observer=new MutationObserver(()=>{const dialogIsOpen=shadowRoot.querySelector("dialog[open], [popover]:popover-open")!=null,previousDialogState=account.dataset.accountSheetOpen==="true";if(ensureAccountDialogStructure(account),ensureAccountDialogInteractions(account),ensureAccountLoginFormStyles(account),ensureAccountSheetDrag(account),syncAccountDialogLayout(account),closingAccounts.has(account)){if(!dialogIsOpen){finishAccountPopupState(account,!1);return}syncAccountSheetState();return}if(dialogIsOpen!==previousDialogState){finishAccountPopupState(account,dialogIsOpen);return}dialogIsOpen&&ensureAccountDialogActive(account),syncAccountSheetState()});observer.observe(shadowRoot,{subtree:!0,childList:!0,attributes:!0,attributeFilter:["open"]}),accountObservers.set(account,observer)},closeAccountPopup=account=>{const dialog=getAccountDialog(account),accountPanel=getAccountPanel(account);if(!(dialog instanceof HTMLDialogElement))return;if(!dialog.hasAttribute("open")){finishAccountPopupState(account,!1);return}if(!(accountPanel instanceof HTMLElement)){dialog.close();return}if(dialog.classList.contains(accountDialogClosingClass))return;startClosingAccountPopup(account),clearAccountCloseTimer(account),syncAccountDialogLayout(account),dialog.classList.remove(accountDialogActiveClass),dialog.classList.add(accountDialogClosingClass);const finishClose=()=>{if(clearAccountCloseTimer(account),dialog.hasAttribute("open")){requestNativeAccountClose(account),window.setTimeout(()=>{dialog.hasAttribute("open")&&dialog.close()},32);return}finishAccountPopupState(account,!1)},handleAnimationEnd=event=>{event.target!==accountPanel||event.animationName!==getAccountCloseAnimationName(account)||finishClose()};accountPanel.addEventListener("animationend",handleAnimationEnd),accountCloseTimers.set(account,{timeoutId:window.setTimeout(finishClose,getDialogAnimationDuration(dialog)+32),animationTarget:accountPanel,handleAnimationEnd})},handleAccountShadowClick=(account,event)=>{const target=event.target;if(!(target instanceof Element))return;const dialog=getAccountDialog(account);if(target.closest(".account-button")&&dialog instanceof HTMLDialogElement&&!dialog.hasAttribute("open")){armInitialAccountFieldFocusGuard(account);return}if(target.closest('#close-button, .account__close, button[aria-label="Close menu"]')){if(accountNativeCloseBypass.has(account))return;event.preventDefault(),event.stopImmediatePropagation(),closeAccountPopup(account);return}if(target.closest(`.${accountOverlayClass}`)){event.preventDefault(),event.stopImmediatePropagation(),closeAccountPopup(account);return}target instanceof HTMLDialogElement&&target.hasAttribute("open")&&(event.preventDefault(),event.stopImmediatePropagation(),closeAccountPopup(account))},bindAccountPopup=account=>{!account||account.dataset.accountPopupBound==="true"||(account.dataset.accountPopupBound="true",customElements.whenDefined("shopify-account").then(()=>{ensureAccountDialogStyles(account),ensureAccountDialogStructure(account),ensureAccountLoginFormStyles(account),ensureAccountDialogInteractions(account),ensureAccountSheetDrag(account),syncAccountDialogLayout(account),observeAccountPopup(account),syncAccountSheetState();const shadowRoot=account.shadowRoot;shadowRoot&&(accountInitialFocusGuardRoots.has(shadowRoot)||(shadowRoot.addEventListener("focusin",()=>{handleInitialAccountFieldFocus(account)}),accountInitialFocusGuardRoots.add(shadowRoot)),shadowRoot.addEventListener("click",event=>{handleAccountShadowClick(account,event)},!0),shadowRoot.addEventListener("keydown",event=>{if(event.key!=="Escape")return;const dialog=getAccountDialog(account);!(dialog instanceof HTMLDialogElement)||!dialog.hasAttribute("open")||(event.preventDefault(),event.stopImmediatePropagation(),closeAccountPopup(account))}))}))},bindAccountPopups=(scope=document)=>{scope.querySelectorAll(accountSelector).forEach(account=>{bindAccountPopup(account),syncAccountDialogLayout(account)}),syncAccountSheetState()},handleSectionLoad=event=>{syncHeaderHeight(),bindAccountPopups(event.target||document)},api={bindAccountPopups,syncHeaderHeight};window[globalKey]=api,syncHeaderHeight(),bindAccountPopups(),window.addEventListener("resize",()=>{syncHeaderHeight(),bindAccountPopups()}),document.addEventListener("shopify:section:load",handleSectionLoad)})();
//# sourceMappingURL=/cdn/shop/t/39/assets/header-account-popup.js.map?v=57209730565363496781791032700
