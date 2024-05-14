const BASE_URL = 'http://127.0.0.1:3000'
const userId = 'mbwgtdr'
const password = 'ffhzxxyee3%'
const graphType = 'bar'
const field = 'category'

async function login(userId, password){
    const userJSON = await fetch(`${BASE_URL}/api/users/login`, {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            userId, password
        })
    })
    const user = await userJSON.json()
    return user
}
async function getGroups(field, user){
    let base_url = `${BASE_URL}/api/admin/books/group`
    if(!user.isAdmin){
        base_url = `${BASE_URL}/api/users/books/group`
    }
    console.log(base_url)
    const groupJSON = await fetch(`${base_url}/${field}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
        }
    })
    const group = await groupJSON.json()
    return group.docs
}
async function fetchData(userId, password, field){
    const user = await login(userId, password)
    const group = await getGroups(field, user)
    return group
}
function displayChart(type, group){
    // 차트 그리기
    const ctx = document.getElementById('myChart');
    new Chart(ctx, {
        type,
        data: {
        labels: group.filter(item => item._id !== null && item._id !== undefined && item._id !== '').map(item => item._id),
        datasets: [{
            label: '# of Books',
            data: group.filter(item => item._id !== null && item._id !== undefined && item._id !== '').map(item => item.count),
            borderWidth: 1,
            backgroundColor: '#FFD700',
            borderColor: '#FFD700',
        }]
        },
        options: {
        scales: {
            y: {
            beginAtZero: true
            }
        },
        plugins: {
            colors: {
            enabled: true
            }
        }
        }
    });
}

fetchData(userId, password, field)
.then(group => {
    console.log(group)
    displayChart(graphType, group)
})