// using native fetch
async function test() {
    const res = await fetch('http://127.0.0.1:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'yogie_test_' + Date.now(),
            email: 'yogie_test_' + Date.now() + '@example.com',
            password: 'password123',
            role: 'volunteer',
            volunteerData: {
                name: 'yogie',
                email: 'yogie_test_' + Date.now() + '@example.com',
                phone: '123'
            }
        })
    });
    console.log(res.status);
    console.log(await res.text());
}
test();
