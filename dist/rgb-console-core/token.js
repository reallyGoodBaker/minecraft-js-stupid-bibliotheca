export function createToken(tokenType, basicType, ctorName, content, parent, children, enumerable = true) {
    return {
        tokenType, basicType, ctorName, parent, children, content, enumerable
    };
}
