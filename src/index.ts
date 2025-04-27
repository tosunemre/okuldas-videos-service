const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

function isValidImage(file: File): boolean {
	if (file.type && file.type.startsWith('image/')) {
		return true;
	}
	const lowerName = file.name.toLowerCase();
	return allowedExtensions.some((ext) => lowerName.endsWith(ext));
}

function normalizeString(input: string): string {
	const normalized = input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	return normalized
		.toLowerCase()
		.replace(/\s+/g, '_')
		.replace(/[^a-z0-9_]/g, '');
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (!['DELETE'].includes(request.method)) {
			return new Response('Method Not Allowed', { status: 405 });
		}
		const authHeader = request.headers.get('X-Api-Key');
		if (!authHeader || authHeader !== `${env.AUTH_API_KEY}`) {
			return new Response('Unauthorized', { status: 401 });
		}
		if (request.method === 'DELETE') {
			const deletingVideoUrl = new URL(request.url).searchParams.get('url');
			if (deletingVideoUrl) {
				const parts = deletingVideoUrl.split('/');
				const videoId = parts[parts.length - 2];
				if (videoId) {
					return fetch(`${env.API_URL}/stream/${videoId}`, {
						method: 'DELETE',
						headers: {
							Authorization: `Bearer ${env.API_TOKEN}`,
						},
					});
				}
			}
			return new Promise((resolve) => resolve(new Response('OK', { status: 200 })));
		}
		return new Promise((resolve) => resolve(new Response('Something went wrong', { status: 400 })));
		// try {
		// 	const formData = await request.formData();
		// 	const nodeEnv = (formData.get('env') as string | undefined) ?? 'unknown';
		// 	const timestamp = (formData.get('timestamp') as string | undefined) ?? 'unknown';
		// 	const filesInput = formData.getAll('file');
		// 	if (!filesInput || filesInput.length === 0) {
		// 		return new Response('No file provided', { status: 400 });
		// 	}
		// 	const files = filesInput.filter((input) => input instanceof File);
		// 	const rawImageFiles: File[] = [];
		// 	for (const entry of files) {
		// 		if (!isValidImage(entry)) {
		// 			return new Response(`Invalid file type: ${entry.name}`, { status: 400 });
		// 		}
		// 		rawImageFiles.push(entry);
		// 	}

		// 	// const batchTokenResponse = await fetch(`${env.API_URL}/batch_token`, {
		// 	// 	method: 'GET',
		// 	// 	headers: {
		// 	// 		Authorization: `Bearer ${env.API_TOKEN}`,
		// 	// 	},
		// 	// });
		// 	// const batchTokenResult = (await batchTokenResponse.json()) as { result: { token: string } };
		// 	// const batchToken = String(batchTokenResult.result.token);

		// 	const imageFiles = await Promise.all(
		// 		rawImageFiles.map(async (imageFile) => {
		// 			const formData = new FormData();
		// 			const [name] = imageFile.name.split('.');
		// 			const fileName = `${nodeEnv}_${timestamp}_${normalizeString(name)}.webp`;
		// 			const transformed = await env.IMAGES.input(imageFile.stream()).output({ format: 'image/webp', quality: 100 });
		// 			const image = await transformed.response().blob();
		// 			formData.append('file', image, fileName);
		// 			formData.append('requireSignedURLs', 'false');
		// 			formData.append(
		// 				'metadata',
		// 				JSON.stringify({
		// 					nodeEnv,
		// 					timestamp,
		// 				})
		// 			);

		// 			return await fetch(`${env.API_URL}/images/v1`, {
		// 				method: 'POST',
		// 				headers: {
		// 					Authorization: `Bearer ${env.API_TOKEN}`,
		// 				},
		// 				body: formData,
		// 			}).then(async (response) => await response.json());
		// 		})
		// 	);
		// 	return new Response(JSON.stringify({ data: imageFiles }), {
		// 		headers: { 'Content-Type': 'application/json' },
		// 	});
		// } catch (error) {
		// 	console.error('Error uploading images:', error);
		// 	return new Response('Error uploading images', { status: 500 });
		// }
	},
};
