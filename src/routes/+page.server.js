// // @ts-nocheck
// export const prerender = true;

// /** @type {import('./$types').PageServerLoad} */
// // @ts-ignore
// export async function load({ setHeaders, fetch }) {
// 	const tokenurl = "https://api-dev.jurno.id/api/newsmap/v1/token";
// 	const url = "https://api.jurno.id/api/newsmap/v1/article/list?size=10"
	
// 	async function getToken() {
// 		const token = await fetch(tokenurl)
// 		let t = await token.json()
// 		let access_t = t.access_token
// 		return access_t
// 	}

// 	async function getData(url) {
// 		let t = await getToken()
// 		let tok = `JWT ${t}`
//         console.log(tok)
// 		const response = await fetch(url, {
// 			headers: {
// 				"Authorization": tok
// 			}
// 		})
// 		return response
// 	}

// 	let res = await getData(url)
	
// 	return {
// 		a:res.json()

// 	};
// }