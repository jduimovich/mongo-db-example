
set IMAGE=quay.io/%MY_QUAY_USER%/mongo-db-example 
call docker build -t %IMAGE% .
call docker push %IMAGE% 
oc delete pods --all 
