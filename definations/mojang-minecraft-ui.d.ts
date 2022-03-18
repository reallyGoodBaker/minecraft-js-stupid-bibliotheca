import {Player} from 'mojang-minecraft'

declare class FormResponse {
    /**
     * If true, the form was canceled by the player (e.g., they selected the pop-up X close button).
     */
    readonly isCanceled: boolean;
}

declare class ActionFormResponse extends FormResponse {
    /**
     * Returns the index of the button that was pushed.
     */
    readonly selection: number;
}

declare class MessageFormResponse extends ActionFormResponse {}

declare class ModalFormResponse  extends FormResponse {
    /**
     * An ordered set of values based on the order of controls specified by ModalFormData.
     */
    readonly formValues: any[];
}

class DataResponseMap {
    Action: ActionFormResponse;
    Message: MessageFormResponse;
    Modal: ModalFormResponse;
}

class BaseFormData<T extends keyof DataResponseMap> {

    /**
     * This builder method sets the title for the modal dialog.
     */
    title(titleText: string): this;

    /**
     * Creates and shows this modal popup form. Returns asynchronously when the player confirms or cancels the dialog.
     */
    show(player: Player): Promise<DataResponseMap[T]>

    /**
     * Creates a new modal form builder.
     */
    new(): this;
    
}


declare class ActionFormData extends BaseFormData<'Action'> {

    /**
     * Method that sets the body text for the modal form.
     */
    body(bodyText: string): ActionFormData;

    /**
     * Adds a button to this form with an icon from a resource pack.
     */
    button(text: string, iconPath?: string): ActionFormData

}

declare class MessageFormData extends BaseFormData<'Message'> {

    /**
     * Method that sets the body text for the modal form.
     */
    body(bodyText: string): MessageFormData;

    /**
     * Method that sets the text for the first button of the dialog.
     */
    button1(text: string): MessageFormData;

    /**
     * This method sets the text for the second button on the dialog.
     */
    button1(text: string): MessageFormData;

}


declare class ModalFormData extends BaseFormData<'Modal'> {

    /**
     * Adds a dropdown with choices to the form.
     */
    dropdown(label: string, options: string[], defaultValueIndex?: number): ModalFormData;

    /**
     * Adds an icon to the form using a graphic resource from a resource pack.
     */
     icon(iconPath: string): ModalFormData;

     /**
      * Adds a numeric slider to the form.
      */
      slider(label: string, minimumValue: number, maximumValue: number, valueStep: number, defaultValue?: number): ModalFormData;

      /**
       * Adds a textbox to the form.
       */
       textField(label: string, placeholderText: string, defaultValue?: string): ModalFormData;

       /**
        * Adds a toggle checkbox button to the form.
        */
        toggle(label: string, defaultValue?: boolean): ModalFormData;
        
}