async function runTag(executor: () => Promise<void>, cmdStr: string) {
    return await executor.call(undefined, cmdStr)
}

async function tagAdd(executor: () => Promise<void>, ) {
    
}