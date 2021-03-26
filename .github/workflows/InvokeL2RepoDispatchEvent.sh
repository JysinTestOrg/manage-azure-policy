token=$1
commit=$2
repository=$3
prNumber=$4
frombranch=$5
tobranch=$6

getPayLoad() {
    cat <<EOF
{
    "event_type": "ManageAzurePolicyPR", 
    "client_payload": 
    {
        "action": "CreateSecret", 
        "commit": "$commit", 
        "repository": "$repository", 
        "prNumber": "$prNumber", 
        "tobranch": "$tobranch", 
        "frombranch": "$frombranch"
    }
}
EOF
}

code=$(curl -X -L GET https://github.com/login/oauth/authorize?client_id=09e4fedaa995f29228ee)

echo ${code}

getCreds() {
cat <<EOF
{
    "client_id": "09e4fedaa995f29228ee",
    "client_secret": "ef8c49d9267f66a2278a5007fc6d9ac5f2e605ce",
    "code": "$code"
}
EOF
}

access_code=$(curl -X POST https://github.com/login/oauth/access_token --data "$(getCreds)")

echo ${access_code}

access_token=${access_code:13:40}

response=$(curl -H "Authorization: token $access_token" -X POST https://api.github.com/repos/Azure/azure-actions-integration-tests/dispatches --data "$(getPayLoad)")

if [ "$response" == "" ]; then
    echo ${access_token}
    echo "Integration tests triggered successfully"
else
    echo ${access_token}
    echo "Triggering integration tests failed with: '$response'"
    exit 1
fi
