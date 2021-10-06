from rest_framework import serializers, viewsets
from rest_framework.response import Response
from .models import Person, Partnership
from collections import namedtuple

class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = "__all__"
    
class PartnershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partnership
        fields = "__all__"

class RelationSerializer(serializers.Serializer):
    people = PersonSerializer(many=True)
    partnerships = PartnershipSerializer(many=True)

class CreatePersonSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    class Meta:
        model = Person
        fields = ("id","user", "name")

class CreatePartnershipSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    class Meta:
        model = Partnership
        fields = ("id", "partner1", "partner2", "partner1_parent", "partner2_parent")

class CreateRelationSerializer(serializers.Serializer):
    people = CreatePersonSerializer(many=True)
    partnerships = CreatePartnershipSerializer(many=True)