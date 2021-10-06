from django.db import models

class Person(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.CharField(max_length=200, default=None, null=True)
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name

class Partnership(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.CharField(max_length=200, default=None, null=True)
    partner1 = models.ForeignKey(Person, default=None, null=True, on_delete=models.SET_DEFAULT, related_name='partnership1')
    partner2 = models.ForeignKey(Person, default=None, null=True, blank=True, on_delete=models.SET_DEFAULT, related_name='partnership2')
    partner1_parent = models.ForeignKey('self', default=None, null=True, blank=True, on_delete=models.SET_DEFAULT, related_name='child_rel1')
    partner2_parent = models.ForeignKey('self', default=None, null=True, blank=True, on_delete=models.SET_DEFAULT, related_name='child_rel2')

    def __str__(self):
        if self.partner2 == None:
            return "Solteiro: {}".format(self.partner1)
        else:
            return "Relacionamento entre {} e {}".format(self.partner1, self.partner2)