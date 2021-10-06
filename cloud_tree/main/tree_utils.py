class PartnershipClass:
    def __init__(self, id, *partners):
        self.partners = []
        self.establish_relationship(partners)
        self.children = []
        self.isPlaceholder = False
        self.id = id
    
    def establish_relationship(self, *partners):
        for partner in partners[0]:
            partner.partnership = self
            self.partners.append(partner)
    
    def add_children(self, *ch):
        for child in ch:
            self.children.append(child.partnership)
            child.parent_relationship = self

    def __getitem__(self, key):
        if isinstance(key, int) or isinstance(key, slice): 
            return self.children[key]
        if isinstance(key, str):
            for child in self.children:
                if child.node == key: return child
    
    def __len__(self):
        return len(self.children)
    
    def __str__(self):
        if len(self.partners) == 2:
            return "Partnership: {} and {}".format(self.partners[0], self.partners[1])
        else:
            return "Partnership: {}".format(self.partners[0])

