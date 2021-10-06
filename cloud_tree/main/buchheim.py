from operator import lt, gt
from sys import stdout

nodes_list = set()

class DrawTree(object):
    def __init__(self, tree, parent=None, depth=0, number=1, inverse=False):
        self.x = -1.
        self.y = depth
        self.tree = tree
        nodes_list.add(self)
        if inverse:
            self.children = []
            i = 0
            for partner in tree.partners:
                if hasattr(partner, 'parent_relationship'):
                    if partner.parent_relationship is not None:
                        self.children.append(DrawTree(partner.parent_relationship, self, depth+1, i+1, inverse))
                        i+=1
        else:
            self.children = [DrawTree(c, self, depth+1, i+1, inverse) 
                            for i, c
                            in enumerate(tree.children)]
        self.parent = parent
        self.thread = None
        self.mod = 0
        self.ancestor = self
        self.change = self.shift = 0
        self._lmost_sibling = None
        #this is the number of the node in its group of siblings 1..n
        self.number = number
        self.id = tree.id

    def left(self): 
        return self.thread or len(self.children) and self.children[0]

    def right(self):
        return self.thread or len(self.children) and self.children[-1]

    def lbrother(self):
        n = None
        if self.parent:
            for node in self.parent.children:
                if node == self: return n
                else:            n = node
        return n

    def get_lmost_sibling(self):
        if not self._lmost_sibling and self.parent and self != \
        self.parent.children[0]:
            self._lmost_sibling = self.parent.children[0]
        return self._lmost_sibling
    lmost_sibling = property(get_lmost_sibling)

    def __str__(self): return "%s: x=%s mod=%s" % (self.tree, self.x, self.mod)
    def __repr__(self): return self.__str__()

def buchheim(tree, inverse=False):
    dt = firstwalk(DrawTree(tree, inverse=inverse))
    min = second_walk(dt)
    if min < 0:
        third_walk(dt, -min)
    
    if inverse:
        max = get_max_depth(dt)
        invert_levels(dt, max)

    return dt

def get_max_depth(tree, max=0):
    if tree.y > max:
        max = tree.y
    for child in tree.children:
        ret = get_max_depth(child, max)
        if ret > max:
            max = ret
    return max

def invert_levels(tree, amount):
    tree.y -= amount
    tree.y *= -1
    for child in tree.children:
        invert_levels(child, amount)

def apply_offset(tree, offset, yoff):
    tree.x += offset
    tree.y += yoff
    for child in tree.children:
        apply_offset(child, offset, yoff)

def third_walk(tree, n):
    tree.x += n
    for c in tree.children:
        third_walk(c, n)

def firstwalk(v, distance=1.):
    if len(v.children) == 0:
        if v.lmost_sibling:
            v.x = v.lbrother().x + distance
        else:
            v.x = 0.
    else:
        default_ancestor = v.children[0]
        for w in v.children:
            firstwalk(w)
            default_ancestor = apportion(w, default_ancestor, distance)
        #print "finished v =", v.tree, "children"
        execute_shifts(v)

        midpoint = (v.children[0].x + v.children[-1].x) / 2

        ell = v.children[0]
        arr = v.children[-1]
        w = v.lbrother()
        if w:
            v.x = w.x + distance
            v.mod = v.x - midpoint
        else:
            v.x = midpoint
    return v

def apportion(v, default_ancestor, distance):
    w = v.lbrother()
    if w is not None:
        #in buchheim notation:
        #i == inner; o == outer; r == right; l == left; r = +; l = -
        vir = vor = v
        vil = w
        vol = v.lmost_sibling
        sir = sor = v.mod
        sil = vil.mod
        sol = vol.mod
        while vil.right() and vir.left():
            vil = vil.right()
            vir = vir.left()
            vol = vol.left()
            vor = vor.right()
            vor.ancestor = v
            shift = (vil.x + sil) - (vir.x + sir) + distance
            if shift > 0:
                move_subtree(ancestor(vil, v, default_ancestor), v, shift)
                sir = sir + shift
                sor = sor + shift
            sil += vil.mod
            sir += vir.mod
            sol += vol.mod
            sor += vor.mod
        if vil.right() and not vor.right():
            vor.thread = vil.right()
            vor.mod += sil - sor
        else:
            if vir.left() and not vol.left():
                vol.thread = vir.left()
                vol.mod += sir - sol
            default_ancestor = v
    return default_ancestor

def move_subtree(wl, wr, shift):
    subtrees = wr.number - wl.number
    #print wl.tree, "is conflicted with", wr.tree, 'moving', subtrees, 'shift', shift
    #print wl, wr, wr.number, wl.number, shift, subtrees, shift/subtrees
    wr.change -= shift / subtrees
    wr.shift += shift
    wl.change += shift / subtrees
    wr.x += shift
    wr.mod += shift

def execute_shifts(v):
    shift = change = 0
    for w in v.children[::-1]:
        #print "shift:", w, shift, w.change
        w.x += shift
        w.mod += shift
        change += w.change
        shift += w.shift + change

def ancestor(vil, v, default_ancestor):
    #the relevant text is at the bottom of page 7 of
    #"Improving Walker's Algorithm to Run in Linear Time" by Buchheim et al, (2002)
    #http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.16.8757&rep=rep1&type=pdf
    if vil.ancestor in v.parent.children:
        return vil.ancestor
    else:
        return default_ancestor

def second_walk(v, m=0, depth=0, min=None):
    v.x += m
    v.y = depth

    if min is None or v.x < min:
        min = v.x

    for w in v.children:
        min = second_walk(w, m + v.mod, depth+1, min)

    return min