# -*- coding: utf-8 -*-
import os

import boto3
import reverse_geocoder as rg

def unicode_flag(code):
    OFFSET = 127397
    points = map(lambda x: ord(x) + OFFSET, code.upper())
    return ('\\U%08x\\U%08x' % tuple(points)).encode().decode('unicode-escape')

def coordinates(results):
    enriched = []
    for res in results:
        for result in rg.search([tuple(res[0])]):
            description = ", ".join([ 
                result['name'], 
                result['admin1'], 
                result['cc'], 
            ])
            enriched.append({
                'latitude': res[0][0],
                'longitude': res[0][1],
                'description': description,
                'cc': result['cc'],
                'confidence': res[1]
            })
    return enriched