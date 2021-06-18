import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeController } from './exchange.controller';
import { ExchangeService } from './exchange.service';
import { ExchangeInputType } from './types/exchange-input.type';

describe('ExchangeController', () => {
  let controller: ExchangeController;
  let service: ExchangeService;
  let mockData;

  beforeEach(async () => {
    const mockExchangeService = {
      convertAmount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExchangeController],
      providers: [
        { provide: ExchangeService, useFactory: () => mockExchangeService },
      ],
    }).compile();

    controller = module.get<ExchangeController>(ExchangeController);
    service = module.get<ExchangeService>(ExchangeService);
    mockData = { from: 'USD', to: 'BRL', amount: 10 } as ExchangeInputType;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('convertAmount', () => {
    it('should be throw when service throw', async () => {
      jest
        .spyOn(service, 'convertAmount')
        .mockRejectedValue(new BadRequestException());

      await expect(controller.convertAmount(mockData)).rejects.toThrow(
        new BadRequestException(),
      );
    });
  });
});