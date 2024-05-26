export class MockResponse {
    public status: Function;
    public send: Function;

    constructor(status: Function, send: Function) {
        this.status = () => {
            status(...arguments);
            return this;
        };
        this.send = () => {
            send(...arguments);
            return this;
        }
    }
}