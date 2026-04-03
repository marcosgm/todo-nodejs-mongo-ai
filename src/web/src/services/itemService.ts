import { RestService } from './restService';
import { TodoItem } from '../models';

export class ItemService extends RestService<TodoItem> {
    public constructor(baseUrl: string, baseRoute: string) {
        super(baseUrl, baseRoute);
    }

    public async generateAiChecklist(name: string, description?: string): Promise<TodoItem> {
        const response = await this.client.request<TodoItem>({
            method: 'POST',
            url: 'ai-checklist',
            data: { name, description },
        });
        return response.data;
    }
}
