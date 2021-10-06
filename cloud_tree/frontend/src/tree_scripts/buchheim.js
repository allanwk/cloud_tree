export class DrawTree{
    constructor(tree, parent=null, depth=0, number=1, inverse=false){
        this.x = -1;
        this.y = depth;
        this.tree = tree;
        if (inverse == true){
            this.children = [];
            var i = 0;
            tree.partners.forEach((partner, i) => {
                if (partner.parent_relationship !== null){
                    this.children.push(new DrawTree(partner.parent_relationship, this, depth+1, i+1, inverse));
                    i++;
                }
            })
        } else {
            this.children = [];
            tree.children.forEach((c, i) => {
                this.children.push(new DrawTree(c, this, depth+1, i+1, inverse));
            })
        }
        this.parent = parent;
        this.thread = null;
        this.mod = 0;
        this.ancestor = this;
        this.change = 0;
        this.shift = 0;
        this._lmost_sibling = null;
        this.number = number;
    }

    left(){
        return this.thread || this.children.length && this.children[0];
    }

    right(){
        return this.thread || this.children.length && this.children[this.children.length - 1];
    }

    lbrother(){
        var n = null;
        if (this.parent) {
            this.parent.children.forEach((node, i)=> {
                if (node == this)
                    return n;
                else
                    n = node;
            })
        }
        return n;
    }

    get_lmost_sibling(){
        if (!this._lmost_sibling && this.parent && this != this.parent.children[0]){
            this._lmost_sibling = this.parent.children[0];
        }
        return this._lmost_sibling;
    }
}

export function buchheim(tree, inverse=false){
    var dt = firstwalk(new DrawTree(tree, inverse=inverse));
    var min = secondwalk(dt);
    if (min < 0){
        thirdwalk(dt, -min);
    }

    if (inverse){
        var max = get_max_depth(dt);
        invert_levels(dt, max);
    }

    return dt;
}

function get_max_depth(tree, max=0){
    if (tree.y > max){
        max = tree.y;
    }
    tree.children.forEach((child, i) => {
        var ret = get_max_depth(child, max);
        if (ret > max){
            max = ret;
        }
    })
    return max;
}

function invert_levels(tree, amount){
    tree.y -= amount;
    tree.y *= -1;
    tree.children.forEach((child, i) => {
        invert_levels(child, amount);
    })
}

function apply_offset(tree, offset, yoff){
    tree.x += offset;
    tree.y += yoff;
    tree.children.forEach((child, i) => {
       apply_offset(child, offset, yoff);
    })
}

function thirdwalk(tree, n){
    tree.x += n;
    tree.children.forEach((child, i) => {
        thirdwalk(child, n);
    })
}

function firstwalk(tree, distance=1.){
    if (tree.children.length == 0){
        if(tree.get_lmost_sibling){
            tree.x = tree.lbrother().x + distance;
        } else {
            tree.x = 0;
        }
    } else {
        var default_ancestor = tree.children[0]
        tree.children.forEach((child, i) => {
            firstwalk(child);
            default_ancestor = apportion(child, default_ancestor, distance);
        })
        execute_shifts(tree);

        midpoint = (tree.children[0].x + tree.children[tree.children.length - 1].x) / 2;
        ell = tree.children[0];
        arr = tree.children[tree.children.length - 1];
        var w = tree.lbrother();

        if (w) {
            tree.x = w.x + distance;
            tree.mod = tree.x - midpoint;
        } else {
            tree.x = midpoint;
        }
    }

    return tree;
}

function apportion(tree, default_ancestor, distance){
    w = tree.lbrother();
    if (w) {
        var vir = tree;
        var vor = tree;
        var vil = w;
        var vol = tree.get_lmost_sibling();
        var sir = tree.mod;
        var sor = tree.mod;
        var sil = vil.mod;
        var sol = vol.mod;

        while (vil.right() && vir.left()){
            vil = vil.right();
            vir = vir.left();
            vol = vol.left();
            vor = vor.right();
            vor.ancestor = tree;
            var shift = (vil.x + sil) - (vir.x + sir) + distance;
            if (shift > 0) {
                move_subtree(ancestor(vil, tree, default_ancestor), tree, shift);
                sir = sir + shift;
                sor = sor + shift;
            }
            sil += vil.mod;
            sir += vir.mod;
            sol += vol.mod;
            sor += vor.mod;
        }
        if (vil.right() && !vor.right()){
            vor.thread = vil.right();
            vor.mod += sil - sor;
        } else {
            if (vir.left() && !vol.left()){
                vol.thread = vir.left();
                vol.mod += sir - sol;
            }
            default_ancestor = tree;
        }
    }
    return default_ancestor;
}

function move_subtree(wl, wr, shift){
    var subtrees = wr.number - wl.number;
    wr.change -= shift / subtrees;
    wr.shift += shift;
    wl.change += shift / subtrees;
    wr.x += shift;
    wr.mod += shift;
}

function execute_shifts(tree){
    var shift = 0;
    var change = 0;
    tree.children.slice().reverse().forEach((w, i) => {
        w.x += shift;
        w.mod += shift;
        change += w.change;
        shift += w.shift + change;
    })
}

function ancestor(vil, v, default_ancestor){
    if(vil.ancestor in v.parent.children)
        return vil.ancestor;
    else
        return default_ancestor;
}

function secondwalk(v, m=0, depth=0, min=null){
    v.x += m;
    v.y = depth;

    if (min == null || v.x < min){
        min = v.x;
    }

    v.children.forEach((w, i) => {
        min = secondwalk(w, m + v.mod, depth+1, min);
    })

    return min;
}