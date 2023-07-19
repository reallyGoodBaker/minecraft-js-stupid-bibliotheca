import { getCtorName } from "./object.js";
import { parse } from "./parse.js";
import { createToken } from "./token.js";
class Printer {
    print(obj) {
        const data = parse(obj);
        const root = createToken('inst', 'virtual', '', null, null, [data]);
        let str = '';
        const handler = (t) => {
            if (t.tokenType === 'inst') {
                str += `${t.ctorName}:\n`;
                this.traverse(t, handler);
            }
            if (t.tokenType === 'field' || t.tokenType === 'inner') {
                const k = t.children.find(v => v.tokenType === 'key');
                const v = t.children.find(v => v.tokenType === 'value');
                str += `${k?.content.toString()}: ${this.preview(v?.content)}\n`;
            }
            if (t.tokenType === 'primary') {
                str += t.content.toString();
            }
            if (t.tokenType === 'item') {
                str += (t.basicType === 'empty' ? 'empty' : t.content) + ', ';
            }
            if (t.tokenType === 'entry') {
                const k = t.children.find(v => v.tokenType === 'key');
                const v = t.children.find(v => v.tokenType === 'value');
                str += `${k?.content.toString()} => ${this.preview(v?.content)}\n`;
            }
            if (t.tokenType === 'accessor') {
                this.traverse(t, handler);
            }
            if (t.tokenType === 'getter' || t.tokenType === 'setter') {
                str += `${t.content.name}()\n`;
            }
        };
        this.traverse(root, handler);
        console.log(str);
    }
    traverse(parent, handler) {
        for (const t of parent.children) {
            handler.call(null, t);
        }
    }
    preview(obj) {
        if (typeof obj === 'string') {
            return `'${obj}'`;
        }
        if (typeof obj === 'object') {
            return `${getCtorName(obj)} {...}`;
        }
        return obj.toString();
    }
}
export const printer = new Printer();
