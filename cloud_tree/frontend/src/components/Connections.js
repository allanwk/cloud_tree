import React from 'react';

export default function Connection(props){
    const width = props.person_width;
    const spacing = props.spacing;
    const height = props.level_height;

    if (props.people.length > 0){
        var lines = []
        lines = props.people.map(function(person){
            const ret_lines = []
            if (!Number.isNaN(person.x)){

                var x1 = person.x + width / 2
                var y1 = person.y
                var y2 = person.y - spacing / 2
                
                if(person.parent_relationship != null){
                    if(!Number.isNaN(person.parent_relationship.partners[0].x)){
                        var parent_rel_x;
                        if(person.parent_relationship.partners.length == 2){
                            parent_rel_x = person.parent_relationship.partners[0].x + width + spacing / 2;
                        } else {
                            parent_rel_x = person.parent_relationship.partners[0].x + width / 2;
                        }
                        ret_lines.push(<line x1={x1.toString()} y1={y1.toString()} x2={x1.toString()} y2={y2.toString()} key={person.id.toString() + 'child'} stroke="white" strokeWidth="2"/>)
                        ret_lines.push(<line x1={x1.toString()} y1={y2.toString()} x2={parent_rel_x.toString()} y2={y2.toString()} key={person.id.toString() + 'to_parent'} stroke="white" strokeWidth="2"/>)
                    }
                }
                
                if(person.partnership.partners.length > 1){
                    var rel_x = person.partnership.partners[0].x + width + spacing / 2;
                    if (person == person.partnership.partners[1]){
                        ret_lines.push(<line x1={person.x.toString()} y1={(person.y + height / 2).toString()} x2={rel_x.toString()} y2={(person.y + height / 2).toString()} key={person.id.toString() + 'rel'} stroke="white" strokeWidth="2"/>)
                    }else{
                        ret_lines.push(<line x1={(person.x + width).toString()} y1={(person.y + height / 2).toString()} x2={rel_x.toString()} y2={(person.y + height / 2).toString()} key={person.id.toString() + 'rel'} stroke="white" strokeWidth="2"/>)
                    }
                }

                if (person.partnership.children.length > 0){
                    if(person.partnership.partners.length == 1){
                        ret_lines.push(<line x1={(person.x + width/2).toString()} y1={(person.y + height).toString()} x2={(person.x + width/2).toString()} y2={(person.y + height + spacing/2).toString()} key={person.id.toString() + 'rel_children'} stroke="white" strokeWidth="2"/>)
                    }else if(person = person.partnership.partners[0]){
                        ret_lines.push(<line x1={(person.x + width + spacing/2).toString()} y1={(person.y + height / 2).toString()} x2={(person.x + width + spacing / 2).toString()} y2={(person.y + height + spacing/2).toString()} key={person.id.toString() + 'rel_children'} stroke="white" strokeWidth="2"/>)
                    }
                }

                return ret_lines;
            }
        })
        return (
            <svg width={(props.max_x + width).toString() } height={props.max_y.toString()}>
                { lines }
            </svg>
        )
    } else {
        return null;
    }
}   