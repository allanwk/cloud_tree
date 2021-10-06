from django.shortcuts import render
from collections import namedtuple
from rest_framework import serializers, viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.settings import api_settings
from .models import Person, Partnership
from .serializers import RelationSerializer, PersonSerializer
from .tree_utils import *
from .buchheim import buchheim, nodes_list, apply_offset
Relation = namedtuple('Relations', ('people', 'partnerships'))


class RelationViewSet(viewsets.ViewSet):
    def list(self, request):
        username = request.GET.get('code')
        try:
            focus_rel = int(request.GET.get('focus'))
        except:
            focus_rel = None
        print(focus_rel)
        all_people = Person.objects.filter(user=username)
        all_partnerhips = Partnership.objects.filter(user=username)
        partnerships = {}
        for partnership in all_partnerhips:
            if partnership.partner2 != None:
                p = PartnershipClass(partnership.id, partnership.partner1, partnership.partner2)
            else:
                p = PartnershipClass(partnership.id, partnership.partner1)
            partnerships[partnership.id] = p
        
        for partnership in all_partnerhips:
            if partnership.partner1_parent != None:
                partnerships[partnership.partner1_parent.id].add_children(partnership.partner1)

            if partnership.partner2_parent != None:
                partnerships[partnership.partner2_parent.id].add_children(partnership.partner2)

        nodes_list.clear()
        if focus_rel is None:
            down = buchheim(list(partnerships.values())[0])
            up = buchheim(list(partnerships.values())[0], inverse=True)
        else:
            down = buchheim(partnerships[focus_rel])
            up = buchheim(partnerships[focus_rel], inverse=True)
        

        if down.x > up.x:
            apply_offset(up, down.x - up.x, 0)
        elif up.x > down.x:
            apply_offset(down, up.x - down.x, 0)

        yoff = up.y - down.y
        apply_offset(down, 0, yoff)

        relation = Relation(
            people = all_people,
            partnerships = all_partnerhips,
        )

        serializer = RelationSerializer(relation)

        #insert coordinate data
        for dt in nodes_list:
            for rel in serializer.data['partnerships']:
                if rel['id'] == dt.id:
                    rel['x'] = dt.x
                    rel['y'] = dt.y
                    rel['show'] = True

        return Response(serializer.data)

class PersonView(APIView):
    def post(self, request, format=None):
        p = None
        person = request.data
        if 'id' in person:
            queryset = Person.objects.filter(id=person['id'])
            if len(queryset) != 0:
                p = queryset[0]
                if 'name' in person:
                    p.name = person['name']
                p.save()
            else:
                return Response("Pessoa inexistente", status=status.HTTP_400_BAD_REQUEST)
        else:
            p = Person(user=person['user'], name=person['name'])
            p.save()

        return Response({'id': p.id}, status=status.HTTP_201_CREATED)
    
    def delete(self, request, format=None):
        person = request.data
        if 'id' in person:
            queryset = Person.objects.filter(id=person['id']).delete()
            return Response("Pessoa removida", status=status.HTTP_200_OK)

        return Response("Campo id necessário", status=status.HTTP_400_BAD_REQUEST)

class PartnershipView(APIView):
    def post(self, request, format=None):
        rel = None
        partnership = request.data
        if 'id' in partnership:
            queryset = Partnership.objects.filter(id=partnership['id'])
            if len(queryset) != 0:
                rel = queryset[0]
                try:
                    if 'partner1' in partnership:
                        rel.partner1 = Person.objects.filter(id=partnership['partner1'])[0]
                    if 'partner2' in partnership:
                        rel.partner2 = Person.objects.filter(id=partnership['partner2'])[0]
                    if 'partner1_parent' in partnership:
                        rel.partner1_parent = Partnership.objects.filter(id=partnership['partner1_parent'])[0]
                    if 'partner2_parent' in partnership:
                        rel.partner2_parent = Partnership.objects.filter(id=partnership['partner2_parent'])[0]
                    rel.save()
                except Exception as e:
                    print(e)
                    return Response(request.data, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response("Relacionamento inexistente", status=status.HTTP_400_BAD_REQUEST)
        else:
            rel = Partnership()
            if 'user' in partnership:
                rel.user = partnership['user']
            try:
                if 'partner1' in partnership:
                    rel.partner1 = Person.objects.filter(id=partnership['partner1'])[0]
                if 'partner2' in partnership:
                    rel.partner2 = Person.objects.filter(id=partnership['partner2'])[0]
                if 'partner1_parent' in partnership:
                    rel.partner1_parent = Partnership.objects.filter(id=partnership['partner1_parent'])[0]
                if 'partner2_parent' in partnership:
                    rel.partner2_parent = Partnership.objects.filter(id=partnership['partner2_parent'])[0]
                rel.save()
            except Exception as e:
                return Response(e, status=status.HTTP_400_BAD_REQUEST)

        return Response({'id': rel.id}, status=status.HTTP_201_CREATED)
    
    def delete(self, request, format=None):
        partnership = request.data
        if 'id' in partnership:
            Partnership.objects.filter(id=partnership['id']).delete()
            return Response("Relacionamento removido", status=status.HTTP_200_OK)

        return Response("Campo id necessário", status=status.HTTP_400_BAD_REQUEST)


