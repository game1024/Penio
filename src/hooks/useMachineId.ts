import { invoke } from '@tauri-apps/api/core';

/**
 * 初始化并缓存机器ID
 * 建议在应用启动时调用此函数
 * @returns Promise<string> 返回机器ID
 */
let MACHINE_ID: string | null = null;

export function useMachineId() {
    const initMachineId = async (): Promise<string> => {
        if (MACHINE_ID) {
            return MACHINE_ID;
        }

        MACHINE_ID = await getMachineId();
        console.log('Machine ID initialized:', MACHINE_ID);
        return MACHINE_ID;
    }

    const getMachineId = async (): Promise<string> => {
        try {
            const id = await invoke<string>('get_machine_id');
            return id;
        } catch (error) {
            console.error('Failed to get machine ID:', error);
            throw error;
        }
    }

    const machineId = (): string | null => {
        return MACHINE_ID;
    }

    return { initMachineId, machineId };
}