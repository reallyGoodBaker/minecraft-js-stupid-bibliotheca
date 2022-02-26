const nullFunc = () => undefined;

function _action(ui, player, options) {
     let title;
     let body;
     let btns = [];
     let onCanceled;
     let selection;

     if (options) {
          title = options.title;
          body = options.body;
          btns = Array.isArray(options.btns)? options.btns: [];
          onCanceled = typeof options.onCanceled === 'function'? options.onCanceled: nullFunc;
     }

     let act = new ui.Action();
     act.title(title);
     act.body(body);

     btns.forEach(btn => {
          act.button(btn.text, btn.icon);
     });

     act.show(player)
     .then(response => {
          if (response.isCanceled) {
               return onCanceled.call(undefined);
          }
     
          selection = btns[response.selection];
          if (typeof selection.onClick === 'function') {
               selection.onClick();
          }
     })
     .catch(e => onCanceled.call(undefined, e));
}

async function _message(ui, player, options) {
     let title;
     let body;
     let btns = [];
     let onCanceled;
     let selection;
     
     if (options) {
          title = options.title;
          body = options.body;
          btns = Array.isArray(options.btns)? options.btns: [];
          onCanceled = typeof options.onCanceled === 'function'? options.onCanceled: nullFunc;
     }

     let msg = new ui.Message();
     msg.title(title);
     msg.body(body);

     btns = btns.slice(0, 2);
     btns.forEach((btn, i) => {
          msg[`button${2-i}`](btn.text);
     });

     msg.show(player)
     .then(response => {
          if (response.isCanceled) {
               return onCanceled.call(undefined);
          }
     
          selection = btns[response.selection];
          if (typeof selection.onClick === 'function') {
               selection.onClick();
          }
     })
     .catch(e => onCanceled.call(undefined, e));

}

function _modal(ui, player, options) {
     let modal = new ui.Modal();
     let title;
     let onCanceled;
     let children;
     let callbacks = [];

     if (options) {
          title = options.title || '';
          onCanceled = typeof options.onCanceled === 'function'? options.onCanceled: nullFunc;
          children = Array.isArray(options.children)? options.children: [];
     }

     modal.title(title);
     children.forEach(child => {
          let {type, args, callback} = child;

          modal[type](...args);
          callbacks.push(callback);
     });

     modal.show(player)
     .then(data => {
          if (data.isCanceled) {
               return onCanceled.call(undefined);
          }

          const {formValues} = data;
          callbacks.forEach((func, i) => {
               if (typeof func === 'function') {
                    func.call(undefined, formValues[i]);
               }
          });

     })
     .catch(e => onCanceled.call(undefined, e));
}

export class FuckYouMojangUI {
     constructor(module) {
          this.Action = module.ActionFormData;
          this.Message = module.MessageFormData;
          this.Modal = module.ModalFormData;
     }

     build() {
          let self = this;
          return {
               action(player, options) {
                    _action(self, player, options);
               },

               message(player, options) {
                    _message(self, player, options)
               },

               modal(player, options) {
                    _modal(self, player, options);
               }
          }
     }
}

export const button = (text, icon, callback) => {
    let useIcon = true;
    let callbackFunc = callback;

    if (typeof icon === 'function') {
        useIcon = false;
        callbackFunc = icon;
    }

    return {
        text, icon: useIcon? icon: '', onClick: callbackFunc
    }
}

export const dropdown = (label, options, defaultVal, onSelected=nullFunc) => {
     let defVal;
     let onSel;

     if (typeof defaultVal === 'function') {
          onSel = defaultVal;
     } else {
          defVal = defaultVal;
          onSel = onSelected;
     }

     return {
          type: 'dropdown', args:[label, options, defVal], callback: onSel
     }

}

export const icon = path => ({type: 'icon', args:[path]});

export const slider = (label, min=0, max=100, step=1, defVal=0, onChange=nullFunc) => {
     if (typeof defVal === 'function') {
          onChange = defVal;
          defVal = undefined;
     }
     return {type: 'slider', args:[label, min, max, step, defVal], callback:onChange}
}

export const textField = (label, placeholder, defVal, onChange=nullFunc) => {
     if (typeof defVal === 'function') {
          onChange = defVal;
          defVal = undefined;
     }
     return {type: 'textField', args: [label, placeholder, defVal], callback: onChange}
}

export const toggle = (label, defVal, onToggle=nullFunc) => {
     if (typeof defVal === 'function') {
          onToggle = defVal;
          defVal = undefined;
     }
     return {type: 'toggle', args:[label, defVal], callback: onToggle}
}

