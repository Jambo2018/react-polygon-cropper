export enum Position { out, in, top_left, top_right, bottom_right, bottom_left, top, right, bottom, left };
export const rec_curser=["default","move","se-resize","sw-resize","se-resize","ne-resize","n-resize","e-resize","n-resize","e-resize"]
export const square_curser=["default","move","default","default","se-resize","default","default","default","default","default"]
export const DW: number = 10;
type Rectangle = {
    x: number,
    y: number,
    width: number,
    height: number
}
type Cors = {
    clientX: number,
    clientY: number
}
type Last = {
    x: number,
    y: number
}
export function isInArea(n0: number, n1: number, n: number) {
    return n > n0 && n < n1
}

export function on_down(rec: Rectangle, client: Cors): number {
    const { x, y, width, height } = rec;
    const { clientX, clientY } = client;
    let pos;
    if (
        isInArea(x + DW / 2, x + width - DW / 2, clientX) && isInArea(y + DW / 2, y + height - DW / 2, clientY)
    ) {
        pos = Position.in;
    } else if (
        isInArea(x - DW / 2, x + DW / 2, clientX) && isInArea(y - DW / 2, y + DW / 2, clientY)
    ) {
        pos = Position.top_left;
    } else if (
        isInArea(x + width - DW / 2, x + width + DW / 2, clientX) && isInArea(y - DW / 2, y + DW / 2, clientY)
    ) {
        pos = Position.top_right;
    } else if (
        isInArea(x + width - DW / 2, x + width + DW / 2, clientX) && isInArea(y + height - DW / 2, y + height + DW / 2, clientY)
    ) {
        pos = Position.bottom_right;
    } else if (
        isInArea(x - DW / 2, x + DW / 2, clientX) && isInArea(y + height - DW / 2, y + height + DW / 2, clientY)
    ) {
        pos = Position.bottom_left;
    } else if (
        isInArea(x + DW / 2, x + width - DW / 2, clientX) && isInArea(y - DW / 2, y + DW / 2, clientY)
    ) {
        pos = Position.top;
    } else if (
        isInArea(x + width - DW / 2, x + width + DW / 2, clientX) && isInArea(y + DW / 2, y + height - DW / 2, clientY)
    ) {
        pos = Position.right;
    } else if (
        isInArea(x + DW / 2, x + width - DW / 2, clientX) && isInArea(y + height - DW / 2, y + height + DW / 2, clientY)
    ) {
        pos = Position.bottom;
    } else if (
        isInArea(x - DW / 2, x + DW / 2, clientX) && isInArea(y + DW / 2, y + height - DW / 2, clientY)
    ) {
        pos = Position.left;
    } else {
        pos = Position.out;
    }
    return pos;
}

export function on_move(rec: Rectangle, client: Cors, last: Last, pos: Position, square?: boolean): Rectangle {
    const { clientX, clientY } = client;
    let { x, y, width, height } = rec;
    let dx = clientX - last.x;
    let dy = clientY - last.y;
    const bx = x + width;
    const by = y + height;
    switch (pos) {
        case Position.in:
            x += dx;
            y += dy;
            break;
        case Position.top_left:
            if (square) break;
            x = clientX;
            y = clientY;
            width = bx - x;
            height = by - y;
            break;
        case Position.top_right:
            if (square) break;
            height -= dy;
            y = by - height;
            width += dx;
            break;
        case Position.bottom_right:
            if (square) {
                if (Math.abs(dx) < Math.abs(dy)) dy = dx;
                else dx = dy;
            }
            width += dx;
            height += dy
            break;
        case Position.bottom_left:
            if (square) break;
            x = clientX;
            width = bx - x
            height += dy;
            break;
        case Position.top:
            if (square) break;
            y = clientY;
            height = by - y;
            break;
        case Position.bottom:
            if (square) break;
            height += dy;
            break;
        case Position.right:
            if (square) break;
            width += dx
            break;
        case Position.left:
            if (square) break;
            x = clientX;
            width = bx - x
            break;
        default: break;
    }
    return { x, y, width, height };
}
