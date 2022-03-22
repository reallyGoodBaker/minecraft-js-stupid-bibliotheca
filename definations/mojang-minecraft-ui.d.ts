import {Player} from 'mojang-minecraft'

interface FormResponse {
    /**
     * If true, the form was canceled by the player (e.g., they selected the pop-up X close button).
     */
    readonly isCanceled: boolean;
}
export var FormResponse: {
    prototype: FormResponse;
    new(): FormResponse;
}

interface ActionFormResponse extends FormResponse {
    /**
     * Returns the index of the button that was pushed.
     */
    readonly selection: number;
}
export var ActionFormResponse: {
    prototype: ActionFormResponse;
    new(): ActionFormResponse;
}

interface MessageFormResponse extends ActionFormResponse {}
export var MessageFormResponse: {
    prototype: MessageFormResponse;
    new(): MessageFormResponse;
}

interface ModalFormResponse  extends FormResponse {
    /**
     * An ordered set of values based on the order of controls specified by ModalFormData.
     */
    readonly formValues: any[];
}
export var ModalFormResponse: {
    prototype: ModalFormResponse;
    new(): ModalFormResponse;
}

type DataResponseType<T>  =  T extends ActionFormData? ActionFormResponse:
    T extends MessageFormData? MessageFormResponse:
        T extends ModalFormData? ModalFormResponse: never;

interface BaseFormData {

    /**
     * This builder method sets the title for the modal dialog.
     */
    title(titleText: string): this;

    /**
     * Creates and shows this modal popup form. Returns asynchronously when the player confirms or cancels the dialog.
     */
    show<T>(this: T, player: Player): Promise<DataResponseType<T>>
    
}


interface ActionFormData extends BaseFormData {

    /**
     * Method that sets the body text for the modal form.
     */
    body(bodyText: string): ActionFormData;

    /**
     * Adds a button to this form with an icon from a resource pack.
     */
    button(text: string, iconPath?: string): ActionFormData

}
export var ActionFormData: {
    prototype: ActionFormData;
    new(): ActionFormData;
}

interface MessageFormData extends BaseFormData {

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
    button2(text: string): MessageFormData;

}
export var MessageFormData: {
    prototype: MessageFormData;
    new(): MessageFormData;
}


interface ModalFormData extends BaseFormData {

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
export var ModalFormData: {
    prototype: ModalFormData;
    new(): ModalFormData;
}
