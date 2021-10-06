export class Person{
    constructor(name, id){
        this.name = name;
        this.id = id;
        this.partnership = null;
        this.y = null;
        this.x = null;
        this.parent_relationship = null;
    }
}

export class Partnership{
    constructor(partners){
        this.partners = [];
        this.establish_relationship(partners);
        this.children = [];
        this.x = null;
        this.y = null;
        this.id = null;
        this.show = false;
    }

    establish_relationship(partners){
        for(var i = 0; i < partners.length; i++){
            if(partners[i] != null){
                partners[i].partnership = this;
                this.partners.push(partners[i]);
            }
        }
    }

    add_children(children){
        if(typeof children.length !== 'undefined'){
            for(var i = 0; i < children.length; i++){
                this.children.push(children[i].partnership);
                children[i].parent_relationship = this;
            }
        } else {
            this.children.push(children.partnership);
            children.parent_relationship = this;
        }
    }
}

